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
  const [assignee, setAssignee] = useState(node.assignee ?? "");
  const [effortDays, setEffortDays] = useState(node.effortDays);
  const [actualStartDate, setActualStartDate] = useState(node.actualStartDate);
  const [actualEndDate, setActualEndDate] = useState(node.actualEndDate);
  const [notes, setNotes] = useState(node.notes ?? "");
  const [category, setCategory] = useState(node.category ?? "");
  const [milestone, setMilestone] = useState(node.milestone);
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
      assignee: assignee,
      effortDays: effortDays,
      actualStartDate: actualStartDate,
      actualEndDate: actualEndDate,
      notes: notes,
      category: category,
      milestone: milestone,
    };

    if (startDate > endDate) {
      setErrorMessage("計画開始は計画終了以前の日付にしてください");
      return;
    }

    setErrorMessage("");

    updateMutation.mutate({ id: node.id, item: updatedItem });
  };

  // 表示モード（WbsTreeNode）と同じ7列に、編集用の入力欄をはめ込む。
  // 行ごとフォームに差し替わっても、列の位置はズレない。
  return (
    <>
      <div className="wbs-cell wbs-cell-name wbs-cell-edit-name">
        <label className="wbs-edit-mini-field">
          タスク名
          <input
            type="text"
            className="wbs-edit-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="wbs-edit-mini-field">
          備考
          <textarea
            className="wbs-edit-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <label className="wbs-edit-mini-field">
          カテゴリ
          <input
            type="text"
            className="wbs-edit-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
      </div>

      <div className="wbs-cell">
        <input
          type="text"
          className="wbs-edit-input"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
      </div>

      <div className="wbs-cell">
        <select
          className="wbs-edit-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as WbsItemStatus)}
        >
          {Object.entries(WBS_ITEM_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="wbs-cell">
        <select
          className="wbs-edit-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value as WbsItemPriority)}
        >
          {Object.entries(WBS_ITEM_PRIORITY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="wbs-cell">
        <input
          type="number"
          min="0"
          max="100"
          className="wbs-edit-input"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
      </div>

      <div className="wbs-cell wbs-cell-actions">
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
      </div>

      <div className="wbs-cell wbs-cell-timeline wbs-cell-edit-timeline">
        <label className="wbs-edit-mini-field">
          計画開始
          <input
            type="date"
            className="wbs-edit-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="wbs-edit-mini-field">
          計画終了
          <input
            type="date"
            className="wbs-edit-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <div className="wbs-edit-field-row">
          <label className="wbs-edit-mini-field wbs-edit-mini-field-grow">
            工数
            <input
              type="number"
              step="0.5"
              className="wbs-edit-input"
              value={effortDays === null ? "" : String(effortDays)}
              onChange={(e) =>
                setEffortDays(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </label>
          <label className="wbs-edit-mini-field wbs-edit-mini-field-row">
            マイルストーン
            <input
              type="checkbox"
              checked={milestone}
              onChange={(e) => setMilestone(e.target.checked)}
            />
          </label>
        </div>
        <label className="wbs-edit-mini-field">
          実績開始
          <input
            type="date"
            className="wbs-edit-input"
            value={actualStartDate === null ? "" : String(actualStartDate)}
            onChange={(e) =>
              setActualStartDate(
                e.target.value === "" ? null : String(e.target.value),
              )
            }
          />
        </label>
        <label className="wbs-edit-mini-field">
          実績終了
          <input
            type="date"
            className="wbs-edit-input"
            value={actualEndDate === null ? "" : String(actualEndDate)}
            onChange={(e) =>
              setActualEndDate(
                e.target.value === "" ? null : String(e.target.value),
              )
            }
          />
        </label>
      </div>

      {(updateMutation.isError || errorMessage) && (
        <div className="wbs-cell wbs-cell-edit">
          {updateMutation.isError && (
            <p className="wbs-error">
              更新に失敗しました：{updateMutation.error?.message}
            </p>
          )}
          {errorMessage && <p className="wbs-error">{errorMessage}</p>}
        </div>
      )}
    </>
  );
};
