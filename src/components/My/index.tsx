import { useState } from "react";
import Modal from "@/components/Modal";
import * as secp from "@noble/secp256k1";
import "./style.less";

interface MyProps {
    pubkey: string;
    privkey: string;
    onChange: (privKey: string) => void;
    hide: Function;
}

const FilterModal = (props: MyProps) => {
    const { pubkey, privkey, hide, onChange } = props;
    const [key, setKey] = useState(privkey);
    const [error, setError] = useState(false);

    return (
        <Modal className={"my-dialog"}>
            <form>
                <fieldset className={`${error ? "error-key" : ""}`}>
                    <legend>我的信息</legend>
                    <div className="form-group">
                        <label>公钥:</label>
                        <input type="text" defaultValue={pubkey} disabled />
                    </div>
                    <div className="form-group">
                        <label>私钥:</label>
                        <input
                            type="password"
                            autoComplete="off"
                            defaultValue={privkey}
                            onChange={v => setKey(v.target.value)}
                            placeholder="一定要保护好它!"
                        />
                    </div>
                </fieldset>
            </form>
            <div className="dialog-opt">
                <div className="right">
                    <button className="btn btn-error btn-ghost" onClick={() => hide()}>
                        关闭
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={_ => {
                            try {
                                secp.getPublicKey(key);
                                onChange(key);
                                setError(false);
                            } catch {
                                setError(true);
                            }
                        }}
                    >
                        修改
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default FilterModal;
