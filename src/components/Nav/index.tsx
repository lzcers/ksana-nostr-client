import { useEffect, useState } from "react";

export default (props: { showMy: Function }) => {
    const { showMy } = props;
    const [active, setActive] = useState("client");
    const isActive = (name: string) => (active === name ? "active" : "");

    return (
        <div className="terminal-nav">
            <div className="terminal-logo">
                <div className="logo terminal-prompt">
                    <a href="#" className="no-style">
                        ksana.net
                    </a>
                </div>
            </div>
            <nav className="terminal-menu">
                <ul>
                    <li>
                        <a className={`menu-item ${isActive("client")}`} onClick={() => setActive("client")}>
                            Nostr Client
                        </a>
                    </li>
                    {/* <li>
                        <a className={`menu-item ${isActive("relay")}`} onClick={() => setActive("relay")}>
                            Relay
                        </a>
                    </li> */}
                    <li>
                        <a className={`menu-item ${isActive("my")}`} onClick={() => showMy()}>
                            My
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};
