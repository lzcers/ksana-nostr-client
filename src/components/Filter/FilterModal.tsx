import Modal from "@/components/Modal";
import { NostrFilter } from "@/pages/feeds/model";
import { useState } from "react";

export type EditableFilter = Partial<NostrFilter> & { id: string };

interface FilterModalProps {
    filter: EditableFilter | null;
    hide: Function;
    onEdit: (f: EditableFilter) => void;
    onChange: (f: EditableFilter) => void;
    remove: (id: string) => void;
}

const FilterModal = (props: FilterModalProps) => {
    const { filter: pfilter, hide, remove, onChange, onEdit } = props;
    const [filter, setFilter] = useState<EditableFilter>(pfilter ?? { id: "" });
    const setFields = (fields: Partial<EditableFilter>) => {
        setFilter(prev => {
            return { ...prev, ...fields };
        });
    };
    const getLocalDatetimeStr = (unixStamp: number): string => {
        return new Date(unixStamp * 1000).toISOString().slice(0, 10) + "T" + new Date(unixStamp * 1000).toLocaleTimeString().slice(0, -3);
    };

    return (
        <Modal className="filter-dialog">
            <form>
                <fieldset>
                    <legend>{pfilter ? "编辑" : "新增"}订阅</legend>
                    <div className="form-group">
                        <label>名称:</label>
                        <input
                            type="text"
                            required
                            defaultValue={filter.id}
                            placeholder="订阅名称"
                            onChange={v => setFields({ id: v.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>事件:</label>
                        <textarea
                            placeholder="事件 ID"
                            defaultValue={filter.ids}
                            onChange={v => setFields({ ids: v.target.value.trim() === "" ? [] : v.target.value.split(",") })}
                        />
                    </div>
                    <div className="form-group">
                        <label>作者:</label>
                        <textarea
                            defaultValue={filter.authors}
                            onChange={v => setFields({ authors: v.target.value.trim() === "" ? [] : v.target.value.split(",") })}
                            placeholder="你关注哪些人? 填入他们的公钥，多人请用「,」分隔"
                        />
                    </div>
                    <div className="form-group">
                        <label>类型:</label>
                        <input
                            type="text"
                            defaultValue={filter.kinds?.toString()}
                            onChange={v => setFields({ kinds: v.target.value.trim() === "" ? [] : v.target.value.split(",").map(i => Number(i)) })}
                            placeholder="0 设置元信息、1 纯文本消息、4 加密消息 ..."
                        />
                    </div>
                    <div className="form-group">
                        <label>事件标签:</label>
                        <textarea
                            defaultValue={filter["#e"]?.toString()}
                            onChange={v => setFields({ "#e": v.target.value.trim() === "" ? [] : v.target.value.split(",") })}
                            placeholder="输入事件 ID, 可用「,」分隔输入多个."
                        />
                    </div>
                    <div className="form-group">
                        <label>人物标签:</label>
                        <textarea
                            placeholder=""
                            defaultValue={filter["#p"]?.toString()}
                            onChange={v => setFields({ "#p": v.target.value.trim() === "" ? [] : v.target.value.split(",") })}
                        />
                    </div>
                    <div className="form-group">
                        <label>开始时间:</label>
                        <input
                            type="datetime-local"
                            defaultValue={filter["since"] ? getLocalDatetimeStr(filter["since"]) : undefined}
                            onChange={v => setFields({ since: Date.parse(v.target.value) / 1000 })}
                        />
                    </div>
                    <div className="form-group">
                        <label>结束时间:</label>
                        <input
                            type="datetime-local"
                            defaultValue={filter["until"] ? getLocalDatetimeStr(filter["until"]) : undefined}
                            onChange={v => setFields({ until: Date.parse(v.target.value) / 1000 })}
                        />
                    </div>
                    <div className="form-group">
                        <label>最大数量:</label>
                        <input
                            type="number"
                            min={0}
                            defaultValue={filter.limit?.toString()}
                            onChange={v => setFields({ limit: Number(v.target.value) })}
                        />
                    </div>
                    <div className="dialog-opt">
                        <div className="left">
                            {pfilter && pfilter.id && (
                                <button
                                    className="btn btn-error btn-filter"
                                    onClick={e => {
                                        remove(filter.id);
                                        e.preventDefault();
                                    }}
                                >
                                    删除
                                </button>
                            )}
                        </div>
                        <div className="right">
                            <button
                                className="btn btn-error btn-filter"
                                onClick={e => {
                                    e.preventDefault();
                                    hide();
                                }}
                            >
                                取消
                            </button>
                            <button
                                className="btn btn-primary btn-filter"
                                type="submit"
                                onClick={e => {
                                    if (filter.id.trim() === "") return;
                                    if (!!pfilter) onEdit(filter);
                                    else onChange(filter);
                                    e.preventDefault();
                                }}
                            >
                                确认
                            </button>
                        </div>
                    </div>
                </fieldset>
            </form>
        </Modal>
    );
};

export default FilterModal;
