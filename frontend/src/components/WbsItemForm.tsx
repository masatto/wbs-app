import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchWbsItems, postWbsItem } from "../api/wbsItems";
import type { WbsItemForCreate } from "../types/wbsItem";

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

  const { data, isPending } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
  });

  return (
    <form className="wbs-form" onSubmit={handleSubmit}>
      <label className="wbs-field">
        タスク名
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="wbs-field">
        開始日
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>
      <label className="wbs-field">
        終了日
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </label>
      <label className="wbs-field">
        親番号
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">なし（ルートタスク）</option>
          {!isPending &&
            data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>

      <button type="submit" className="wbs-btn wbs-btn-primary">
        登録
      </button>
    </form>
  );
};
