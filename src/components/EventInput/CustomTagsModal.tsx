import { useState } from "react";
import Modal from "@/components/Modal";

interface CustomTagsModalProps {
    tags: string;
    hide: Function;
    onChange: (v: string) => void;
}

export default (props: CustomTagsModalProps) => {
    const { tags, hide, onChange } = props;
    const [validation, setValidation] = useState(true);
    const placeholder = `["e",<事件 ID>, <推荐的 Relay URL>],\n["p",<公钥>, <推荐的 Relay URL>],\n... // 其它`;
    const validateTags = (v: string) => {
        try {
            JSON.parse(`[${v}]`);
            setValidation(true);
            onChange(v);
        } catch {
            setValidation(false);
        }
    };
    return (
        <Modal className="tags-modal" maskClose={hide}>
            <textarea
                className={`${validation ? "valid" : "invalid"}`}
                cols={30}
                rows={5}
                placeholder={placeholder}
                defaultValue={tags}
                onChange={v => validateTags(v.target.value)}
            />
        </Modal>
    );
};
