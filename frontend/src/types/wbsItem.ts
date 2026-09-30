// バックエンドから返ってくる、フラットな1タスク分の形。
export type WbsItem = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  orderIndex: number;
  parentId: number | null; // ルートタスクはnull
  status: WbsItemStatus;
  priority: WbsItemPriority;
};

// ツリー表示用の形。WbsItemの全フィールド＋自分の子供（同じ型の配列）。
// buildWbsTreeが、フラットなWbsItem[]からこの形を組み立てる。
export type WbsItemNode = WbsItem & {
  children: WbsItemNode[];
};

// 新規登録時に送る形。id・progress・orderIndexはサーバー側で決まる値
// （id自動採番、progressは0スタート、orderIndexも今は未使用）なので、
// フロントからは送らない。
export type WbsItemForCreate = Omit<
  WbsItem,
  "id" | "progress" | "orderIndex" | "status" | "priority"
>;

// 更新時に送る形。idはURLパスに乗るので本文には不要。
// それ以外は全フィールド必須——PUTは部分更新ではなく丸ごと上書きなので、
// 送り忘れたフィールドはサーバー側でリセットされてしまう（WbsItemController参照）。
export type WbsItemForUpdate = Omit<WbsItem, "id">;

export type WbsItemStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "ON_HOLD";

export const WBS_ITEM_STATUS_LABEL: Record<WbsItemStatus, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
  ON_HOLD: "保留",
};

export type WbsItemPriority = "HIGH" | "MEDIUM" | "LOW";

export const WBS_ITEM_PRIORITY_LABEL: Record<WbsItemPriority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};
