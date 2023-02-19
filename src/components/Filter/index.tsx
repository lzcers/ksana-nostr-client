import { useState } from "react";
import { createPortal } from "react-dom";
import FilterModal, { EditableFilter } from "./FilterModal";
import "./style.less";

interface FilterProps {
    filters: EditableFilter[];
    active: EditableFilter | undefined;
    setActive: (f: EditableFilter) => void;
    onChange: (fs: EditableFilter[]) => void;
}

export default (props: FilterProps) => {
    const { filters, active, setActive, onChange } = props;
    const [showModal, setShowModal] = useState(false);
    const [editFilter, setEditFilter] = useState<EditableFilter | null>(null);
    return (
        <div className="filter">
            {showModal &&
                createPortal(
                    <FilterModal
                        filter={editFilter}
                        remove={id => {
                            onChange(filters.filter(f => f.id !== id));
                            setShowModal(false);
                        }}
                        hide={() => {
                            setShowModal(false);
                        }}
                        onEdit={v => {
                            const f = filters.filter(i => i.id !== v.id);
                            onChange([v, ...f]);
                            setShowModal(false);
                        }}
                        onChange={v => {
                            onChange([...filters, v]);
                            setShowModal(false);
                        }}
                    />,
                    document.body
                )}
            {filters.map((filter, ind) => (
                <button
                    key={filter.id + ind}
                    onDoubleClick={() => {
                        setEditFilter(filter);
                        setShowModal(true);
                    }}
                    onClick={() => setActive(filter)}
                    className={`btn ${active && active.id === filter.id ? "btn-primary" : "btn-default"} btn-ghost btn-filter`}
                >
                    {filter.id}
                </button>
            ))}
            <button
                className="btn btn-primary btn-ghost btn-filter"
                onClick={() => {
                    setEditFilter(null);
                    setShowModal(true);
                }}
            >
                新增订阅
            </button>
        </div>
    );
};
