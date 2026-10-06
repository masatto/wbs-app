import type { WbsItemDependency } from "../types/wbsItem";

// WbsItemDependency（先行タスク関連）のCRUD API。
// 一覧は全件取得し、タスクごとの絞り込みはフロント側（taskIdでfilter）で行う。
const BASE_URL = "http://localhost:8080/api/wbs-item-dependencies";

export async function fetchWbsItemDependencies(): Promise<
  WbsItemDependency[]
> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export async function postWbsItemDependency(
  taskId: number,
  predecessorId: number,
): Promise<WbsItemDependency> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, predecessorId }),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export async function deleteWbsItemDependency(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }
}
