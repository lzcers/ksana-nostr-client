import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import CustomTagsModal from "./CustomTagsModal";

import "./style.less";

export default (props: { onSend: (content: string, kind: number, tags: any[][], pubkey?: string) => void }) => {
    const { onSend } = props;
    const [kind, setKind] = useState<number>(1);
    const [content, setContent] = useState<string>("");
    const [recvPubkey, setRecvPubkey] = useState<string>("");
    const [tags, setTags] = useState<string>("");
    const [showCustomKind, setShowCustomKind] = useState(false);
    const [showCustomTags, setShowCustomTags] = useState(false);
    const tagsName = useMemo(() => (JSON.parse(`[${tags}]`) as Array<string>).map(i => i[0]).join(), [tags]);

    return (
        <div className="message-input">
            <div className="form-group content">
                <textarea cols={30} rows={5} placeholder="请输入..." onChange={v => setContent(v.target.value)}></textarea>
            </div>
            <div className="form-group options">
                <div className="left">
                    <div className="form-inline">
                        {showCustomKind ? (
                            <input
                                type="number"
                                defaultValue={kind}
                                onChange={v => setKind(Number(v.target.value))}
                                onKeyDown={e => e.code === "Escape" && setShowCustomKind(false)}
                                className="custom-kind-input"
                            />
                        ) : (
                            <select
                                defaultValue={kind}
                                onChange={v => {
                                    const k = Number(v.target.value);
                                    if (k === -1) {
                                        setShowCustomKind(true);
                                    } else {
                                        setKind(Number(v.target.value));
                                    }
                                }}
                            >
                                <option value={0}>元数据</option>
                                <option value={1}>纯文本</option>
                                <option value={4}>加密</option>
                                <option value={-1}>自定义</option>
                            </select>
                        )}
                    </div>
                    {showCustomTags &&
                        createPortal(<CustomTagsModal tags={tags} onChange={v => setTags(v)} hide={() => setShowCustomTags(false)} />, document.body)}
                    <button className={"btn btn-ghost custom-tags-btn"} onClick={() => setShowCustomTags(true)}>
                        #{tagsName}
                    </button>
                    {kind === 4 && (
                        <input type="text" className="pubkey-input" onChange={v => setRecvPubkey(v.target.value)} placeholder="输入接收方的公钥" />
                    )}
                </div>
                <div className="right">
                    <div className="form-inline">
                        <button className="btn btn-primary btn-send" onClick={() => onSend(content, kind, JSON.parse(`[${tags}]`), recvPubkey)}>
                            发送
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
