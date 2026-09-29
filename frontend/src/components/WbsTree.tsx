import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteWbsItem, fetchWbsItems, putWbsItem } from "../api/wbsItems";
import type { WbsItemForUpdate, WbsItemNode } from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";
import { daysBetween } from "../utils/dateMath";

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

  const earliestStartDate = data.reduce((earliest, item) => {
    return item.startDate < earliest ? item.startDate : earliest;
  }, data[0].startDate);

  return (
    <ul>
      {buildWbsTree(data).map((rootNode) => (
        <WbsTreeNode
          key={rootNode.id}
          node={rootNode}
          timelineStart={earliestStartDate}
          depth={0}
        />
      ))}
    </ul>
  );
};

type Props = {
  node: WbsItemNode;
  timelineStart: string;
  depth: number;
};

export const WbsTreeNode = ({ node, timelineStart, depth }: Props) => {
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

  const offsetDays = daysBetween(timelineStart, node.startDate);
  const durationDays = daysBetween(node.startDate, node.endDate);

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
          <div style={{ paddingLeft: depth * 16 }}>
            <p>{node.name}</p>
          </div>
          <div style={{ position: "relative", height: "20px" }}>
            <div
              style={{
                position: "absolute",
                left: `${offsetDays * 20}px`,
                width: `${durationDays * 20}px`,
                height: "100%",
                backgroundColor: "steelblue",
              }}
            />
          </div>

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
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {node.children.map((child) => (
          <WbsTreeNode
            key={child.id}
            node={child}
            timelineStart={timelineStart}
            depth={depth + 1}
          />
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
