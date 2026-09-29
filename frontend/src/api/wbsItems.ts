import type {
  WbsItem,
  WbsItemForCreate,
  WbsItemForUpdate,
} from "../types/wbsItem";

// バックエンドのWbsItem CRUD APIをまとめたファイル。
// WbsTree（一覧・削除・更新）とWbsItemForm（登録）の両方から使う。
const BASE_URL = "http://localhost:8080/api/wbs-items";

export async function fetchWbsItems(): Promise<WbsItem[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export async function postWbsItem(item: WbsItemForCreate): Promise<WbsItem> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export async function deleteWbsItem(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }
}

export async function putWbsItem(
  id: number,
  item: WbsItemForUpdate,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }
}
