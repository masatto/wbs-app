import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { putWbsItem } from "../api/wbsItems";
import {
  WBS_ITEM_PRIORITY_LABEL,
  WBS_ITEM_STATUS_LABEL,
  type WbsItemForUpdate,
  type WbsItemNode,
  type WbsItemPriority,
  type WbsItemStatus,
} from "../types/wbsItem";

type Props = {
  node: WbsItemNode;
  onClose: () => void;
};

export const WbsItemEditForm = (props: Props) => {
  const { node, onClose } = props;
  // 編集用state
  const [name, setName] = useState(node.name);
  const [startDate, setStartDate] = useState(node.startDate);
  const [endDate, setEndDate] = useState(node.endDate);
  const [progress, setProgress] = useState(node.progress);
  const [status, setStatus] = useState(node.status);
  const [priority, setPriority] = useState(node.priority);
  const [errorMessage, setErrorMessage] = useState("");

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: WbsItemForUpdate }) =>
      putWbsItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
      onClose();
    },
  });

  const handleSave = () => {
    // parentId・orderIndexは編集フォームでは触らせていないが、PUTは
    // 全フィールド必須（部分更新ではない）なので、nodeの現在値をそのまま
    // 乗せて送り返す。ここを省略すると親子関係が壊れる。
    const updatedItem: WbsItemForUpdate = {
      name,
      startDate,
      endDate,
      progress,
      parentId: node.parentId,
      orderIndex: node.orderIndex,
      status: status,
      priority: priority,
    };

    if (startDate > endDate) {
      setErrorMessage("開始日は終了日以前の日付にしてください");
      return;
    }

    setErrorMessage("");

    updateMutation.mutate({ id: node.id, item: updatedItem });
  };

  return (
    <div className="wbs-edit-row">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <input
        type="number"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(Number(e.target.value))}
      />
      <label>
        ステータス
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WbsItemStatus)}
        >
          {Object.entries(WBS_ITEM_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        優先度
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as WbsItemPriority)}
        >
          {Object.entries(WBS_ITEM_PRIORITY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="wbs-btn wbs-btn-primary wbs-btn-sm"
        onClick={handleSave}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? "保存中…" : "保存"}
      </button>
      <button
        type="button"
        className="wbs-btn wbs-btn-sm"
        onClick={onClose}
        disabled={updateMutation.isPending}
      >
        キャンセル
      </button>

      {updateMutation.isError && (
        <p className="wbs-error">
          更新に失敗しました：{updateMutation.error?.message}
        </p>
      )}

      {errorMessage && <p className="wbs-error">{errorMessage}</p>}
    </div>
  );
};
