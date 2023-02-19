import { NostrEvent } from "@/pages/feeds/model";
import "./style.less";

export default (props: { event: NostrEvent }) => {
    const { event } = props;
    const utimeToLocalTime = (unixTimestamp: number) => {
        const dateObj = new Date(unixTimestamp * 1000);
        const utcString = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
        return utcString;
    };
    const copyToClipboard = (v: string) => {
        window.navigator.clipboard.writeText(v);
    };
    return (
        <div className="event">
            <div className="event-info">
                <div className="info-left">
                    <div className="info-item">
                        <span className="hex id" onDoubleClick={() => copyToClipboard(event.pubkey)}>
                            ID: {event.id}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="hex pubkey" onDoubleClick={() => copyToClipboard(event.pubkey)}>
                            PUBKEY: {event.pubkey}
                        </span>
                    </div>
                    {event.kind === 4 && (
                        <div className="info-item secret">
                            <span>㊙</span>
                        </div>
                    )}
                </div>

                <div className="info-item">
                    <span>{utimeToLocalTime(event.created_at)}</span>
                </div>
            </div>

            <div>{event.content}</div>
            <hr />
        </div>
    );
};
