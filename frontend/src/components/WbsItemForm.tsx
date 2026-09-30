import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchWbsItems, postWbsItem } from "../api/wbsItems";
import type { WbsItemForCreate } from "../types/wbsItem";

// タスク新規登録フォーム。useMutationでPOSTし、成功したら
// ["wbsItems"]クエリをinvalidateしてWbsTree側の一覧を再取得させる。
export const WbsItemForm = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parentId, setParentId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

    if (item.startDate > item.endDate) {
      setErrorMessage("開始日は終了日以前の日付にしてください");
      return;
    }

    setErrorMessage("");

    mutation.mutate(item);
  };

  // 親番号の<select>用に、既存タスク一覧を取得する。
  // WbsTreeと同じqueryKeyなのでキャッシュを共有し、二重リクエストにならない。
  // これは「存在しないparentIdを直接入力できてしまう」バグの修正でもある
  // （自由入力の数値欄だと、存在しないidを指すタスクがツリーに一生
  // 表示されない“幽霊データ”になっていた）。
  const { data, isPending } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
  });

  return (
    <>
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
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
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
      <div>{errorMessage && <p className="wbs-error">{errorMessage}</p>}</div>
    </>
  );
};
