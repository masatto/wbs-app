import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { WbsItem, WbsItemForCreate } from "../types/wbsItem";

async function postWbsItem(item: WbsItemForCreate): Promise<WbsItem> {
  const responce = await fetch("http://localhost:8080/api/wbs-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!responce.ok) {
    throw new Error(`HTTP Error:${responce.status}`);
  }

  return responce.json();
}

export const WbsItemForm = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parentId, setParentId] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postWbsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const item: WbsItemForCreate = {
      name,
      startDate,
      endDate,
      parentId: parentId === "" ? null : Number(parentId),
    };

    mutation.mutate(item);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          タスク名
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          開始日
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          終了日
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          親番号
          <input
            type="number"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          />
        </label>
      </div>

      <button type="submit">登録</button>
    </form>
  );
};
