import { useQuery } from "@tanstack/react-query";
import type { WbsItem } from "../types/wbsItem";

async function fetchWbsItem(): Promise<WbsItem[]> {
  const response = await fetch("http://localhost:8080/api/wbs-items");

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export const WbsItemList = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItem,
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
      {data.map((wbsItem) => (
        <li key={wbsItem.id}>{wbsItem.name}</li>
      ))}
    </ul>
  );
};
