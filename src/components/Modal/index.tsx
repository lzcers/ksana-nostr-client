import { ReactElement, ReactNode } from "react";
import "./style.less";

interface ModalProps {
    maskClose?: Function;
    children: ReactElement | ReactNode;
    className?: string;
}
export default (props: ModalProps) => {
    const { children, className, maskClose } = props;
    return (
        <div
            className={`dialog-overlay ${className ?? ""}`}
            onClick={e => {
                e.stopPropagation();
                maskClose && maskClose();
            }}
        >
            <div className="dialog-container" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
