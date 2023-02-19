import { createPortal } from "react-dom";
import Nav from "@/components/Nav";
import My from "@/components/My";
import Message from "@/components/Message";
import MessageInput from "@/components/EventInput";
import Filter from "@/components/Filter";
import useNostrModel from "./model";

export default () => {
    const nostrModel = useNostrModel();
    const { showEvents, filters, activeFilter, privkey, pubkey, showMy } = nostrModel;
    const { setActiveFilter, setPrivkey, setShowMy, setFilters, sendEvent } = nostrModel;

    return (
        <div className="ksana">
            {showMy &&
                createPortal(
                    <My
                        privkey={privkey}
                        pubkey={pubkey}
                        hide={() => setShowMy(false)}
                        onChange={v => {
                            setPrivkey(v);
                            setShowMy(false);
                        }}
                    />,
                    document.body
                )}
            <Nav showMy={() => setShowMy(true)} />
            {privkey.trim() !== "" && <MessageInput onSend={sendEvent} />}
            <Filter filters={filters} active={activeFilter} setActive={f => setActiveFilter(f)} onChange={filters => setFilters(filters)} />
            <section className="list">
                {showEvents.map(event => {
                    return <Message key={event.id} event={event} />;
                })}
            </section>
        </div>
    );
};
