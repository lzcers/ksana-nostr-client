import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as secp from "@noble/secp256k1";
import buffer from "buffer";

type ClientMessage = [];
type Hex = string;

type Tag = [string, ...any];

export interface NostrEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: Tag[];
    content: string;
    sig: string;
}

export interface NostrFilter {
    ids: Hex[];
    authors: Hex[];
    kinds: number[];
    "#e": Hex[];
    "#p": Hex[];
    since: number;
    until: number;
    limit: number;
}

// const KSANA_RELAY_URL = "wss://relay.ksana.net";
const KSANA_RELAY_URL = "ws://127.0.0.1:9002";

const filterEvent = (events: NostrEvent[], filter: Partial<NostrFilter>) => {
    const { ids, authors, kinds, since, until } = filter;
    const [es, ps] = [filter["#e"], filter["#p"]];
    return events
        .filter(evt => {
            if (ids && ids.length > 0) return ids.includes(evt.id);
            return true;
        })
        .filter(evt => {
            if (authors && authors.length > 0) return authors.includes(evt.pubkey);
            return true;
        })
        .filter(evt => {
            if (kinds && kinds.length > 0) return kinds.includes(evt.kind);
            return true;
        })
        .filter(evt => {
            if (es && es.length > 0) return es.includes(evt.id);
            return true;
        })
        .filter(evt => {
            if (ps && ps.length > 0) return ps.includes(evt.pubkey);
            return true;
        })
        .filter(evt => {
            if (since) return evt.created_at > since;
            return true;
        })
        .filter(evt => {
            if (until) return evt.created_at < until;
            return true;
        });
};

const encrypt = (ourPrivateKey: Hex, theirPublicKey: Hex, content: string) => {
    let sharedPoint = secp.getSharedSecret(ourPrivateKey, "02" + theirPublicKey, true);
    let sharedX = secp.utils.bytesToHex(sharedPoint).substring(2);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const cipher = window.browserifyCipher.createCipheriv("aes-256-cbc", buffer.Buffer.from(sharedX, "hex"), iv);
    const encryptedMessage = cipher.update(content, "utf8", "base64");
    const emsg = encryptedMessage + cipher.final("base64");
    return emsg + "?iv=" + buffer.Buffer.from(iv.buffer).toString("base64");
};

function decrypt(privkey: string, pubkey: string, ciphertext: string) {
    const [emsg, iv] = ciphertext.split("?iv=");
    const key = secp.utils.bytesToHex(secp.getSharedSecret(privkey, "02" + pubkey, true)).substring(2);

    const decipher = window.browserifyCipher.createDecipheriv("aes-256-cbc", buffer.Buffer.from(key, "hex"), buffer.Buffer.from(iv, "base64"));
    const decryptedMessage = decipher.update(emsg, "base64");
    const dmsg = decryptedMessage + decipher.final("utf8");

    return dmsg;
}

export default () => {
    const socketRef = useRef<WebSocket>();
    const [events, setEvents] = useState<NostrEvent[]>([]);
    const [filters, setFilters] = useState<(Partial<NostrFilter> & { id: string })[]>([]);
    const [activeFilter, setActiveFilter] = useState<Partial<NostrFilter> & { id: string }>();
    const [privkey, setPrivkey] = useState<Hex>("");
    const [pubkey, setPubkey] = useState<Hex>("");
    const [showMy, setShowMy] = useState(false);
    const [connected, setConnected] = useState(false);

    const showEvents = useMemo(() => {
        const decryptContent = (e: NostrEvent, privkey: string) => {
            if (e.kind !== 4 || e.tags.length === 0) return e;
            try {
                const p = e.tags.find(t => t[0] === "p");
                // 该加密信息的接收方
                if (p && p[1] === pubkey) {
                    e.content = decrypt(privkey, e.pubkey, e.content);
                    // 该加密信息的发送方
                } else if (p && p[1] && e.pubkey == pubkey) {
                    e.content = decrypt(privkey, p[1], e.content);
                }
            } catch {}
            return e;
        };
        return (activeFilter ? filterEvent(events, activeFilter) : [])
            .map(e => decryptContent(e, privkey))
            .sort((a, b) => b.created_at - a.created_at);
    }, [privkey, pubkey, events, activeFilter]);

    const createAuthEvent = async (challenge: string, privkey: string, pubkey: string, relay: string) => {
        const kind = 22242;
        const created_at = Math.floor(new Date().getTime() / 1000);
        const content = "";
        const tags = [
            ["relay", relay],
            ["challenge", challenge],
        ];
        const id = await hashToHex(JSON.stringify([0, pubkey, created_at, kind, tags, ""]));
        const sig = await sigToHex(id, privkey);

        return { id, pubkey, created_at, kind, tags, content, sig };
    };

    const hashToHex = async (str: string) => {
        const u8str = new TextEncoder().encode(str);
        return secp.utils.bytesToHex(await secp.utils.sha256(u8str));
    };

    const sigToHex = async (str: string, privkey: string) => {
        const sig = await secp.schnorr.sign(str, privkey);
        return await secp.schnorr.verify(sig, str, pubkey).then(result => {
            if (!result) return;
            return secp.utils.bytesToHex(sig);
        });
    };

    const sendToSocket = (str: string) => {
        const socket = socketRef.current;
        if (socket) socket.send(str);
    };

    const sendReq = async (req: Partial<NostrFilter> & { id: string }) => {
        const { id, ...filter } = req;
        sendToSocket(JSON.stringify(["REQ", req.id, filter]));
    };

    const sendEvent = async (content: string, kind: number = 0, tags: any[][] = [], recPubkey?: Hex) => {
        const now = Math.floor(new Date().getTime() / 1000);
        let newevent = [0, pubkey, now, kind, tags, content];
        // 加密信息
        if (kind === 4 && recPubkey) {
            const privatenote = encrypt(privkey, recPubkey, content);
            tags.push(["p", recPubkey]);
            newevent = [0, pubkey, now, kind, tags, privatenote];
            content = privatenote;
        }
        const msghash = await hashToHex(JSON.stringify(newevent));
        const sigHex = await sigToHex(msghash, privkey);
        const fullevent = {
            id: msghash,
            pubkey: pubkey,
            created_at: now,
            kind,
            tags,
            content: content,
            sig: sigHex,
        };
        sendToSocket(JSON.stringify(["EVENT", fullevent]));
    };

    const onRelayMessage = (event: MessageEvent<any>) => {
        const relayMsg = JSON.parse(event.data);
        if (relayMsg[0] === "EVENT") {
            const evt = relayMsg[2];
            setEvents(prevEvts => {
                if (prevEvts.find(e => e.id === evt.id)) return prevEvts;
                return [evt, ...prevEvts];
            });
        } else if (relayMsg[0] === "AUTH" && privkey && pubkey) {
            createAuthEvent(relayMsg[1], privkey, pubkey, "wss://relay.ksana.net").then(authEvt => {
                sendToSocket(JSON.stringify(["AUTH", authEvt]));
            });
        }
    };

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !connected) return;
        filters.forEach(filter => sendReq(filter));
        if (!activeFilter && filters[0]) {
            setActiveFilter(filters[0]);
        }
        if (activeFilter) {
            const newActiveFilter = filters.find(f => f.id === activeFilter.id);
            setActiveFilter(newActiveFilter);
        }
        localStorage.setItem("filters", JSON.stringify(filters));
    }, [connected, pubkey, filters]);

    useEffect(() => {
        const socket = socketRef.current;
        if (socket && (socket.CONNECTING || socket.CLOSED)) socket.close();
        const newsocket = new WebSocket(KSANA_RELAY_URL);
        newsocket.addEventListener("open", () => {
            console.log("connect relay success!");
            socketRef.current = newsocket;
            setConnected(true);
        });
        newsocket.addEventListener("message", onRelayMessage);
        newsocket.addEventListener("close", () => setConnected(false));
    }, [pubkey]);

    useEffect(() => {
        if (privkey.trim() === "") return;
        try {
            const pubKeyBytes = secp.schnorr.getPublicKey(privkey);
            const pubKey = secp.utils.bytesToHex(pubKeyBytes);
            setPubkey(pubKey);
            setEvents([]);
            filters.forEach(filter => sendReq(filter));
            sessionStorage.setItem("key", privkey);
        } catch (e) {
            console.error(e);
        }
    }, [privkey]);

    useEffect(() => {
        const sk = sessionStorage.getItem("key");
        const filters = localStorage.getItem("filters");
        if (sk) setPrivkey(sk);
        if (filters) setFilters(JSON.parse(filters));
    }, []);

    return {
        showEvents,
        filters,
        showMy,
        pubkey,
        privkey,
        activeFilter,
        decrypt,
        setActiveFilter,
        filterEvent,
        setPrivkey,
        setShowMy,
        setFilters,
        sendEvent,
    };
};
