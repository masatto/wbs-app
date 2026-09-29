import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteWbsItem, fetchWbsItems, putWbsItem } from "../api/wbsItems";
import type { WbsItemForUpdate, WbsItemNode } from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";

export const WbsTree = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
  });

  if (isPending) {
    return <p>読み込み中…</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  if (data.length === 0) {
    return <p>登録されていません</p>;
  }

  return (
    <ul>
      {buildWbsTree(data).map((rootNode) => (
        <WbsTreeNode key={rootNode.id} node={rootNode} />
      ))}
    </ul>
  );
};

type Props = {
  node: WbsItemNode;
};

export const WbsTreeNode = ({ node }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  // 編集用state
  const [name, setName] = useState(node.name);
  const [startDate, setStartDate] = useState(node.startDate);
  const [endDate, setEndDate] = useState(node.endDate);
  const [progress, setProgress] = useState(node.progress);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteWbsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: number; item: WbsItemForUpdate }) =>
      putWbsItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
      setIsEditing(false);
    },
  });

  const handleDelete = () => {
    if (window.confirm(`「${node.name}」を本当に削除しますか？`)) {
      deleteMutation.mutate(node.id);
    }
  };

  const handleSave = () => {
    const updatedItem: WbsItemForUpdate = {
      name,
      startDate,
      endDate,
      progress,
      parentId: node.parentId,
      orderIndex: node.orderIndex,
    };

    updateMutation.mutate({ id: node.id, item: updatedItem });
  };

  const handleCancel = () => {
    setName(node.name);
    setStartDate(node.startDate);
    setEndDate(node.endDate);
    setProgress(node.progress);
    setIsEditing(false);
  };

  return (
    <li>
      {isEditing ? (
        <>
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
           
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "保存中…" : "保存"}
          </button>
           
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            キャンセル
          </button>
        </>
      ) : (
        <>
          {node.name}

          <button type="button" onClick={() => setIsEditing(true)}>
            編集
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "削除中…" : "削除"}
          </button>
        </>
      )}
      <ul>
        {node.children.map((child) => (
          <WbsTreeNode key={child.id} node={child} />
        ))}
      </ul>

      {deleteMutation.isError && (
        <p>削除に失敗しました：{deleteMutation.error?.message}</p>
      )}

      {updateMutation.isError && (
        <p>更新に失敗しました：{updateMutation.error?.message}</p>
      )}
    </li>
  );
};
