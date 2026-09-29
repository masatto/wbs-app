// バックエンドから返ってくる、フラットな1タスク分の形。
export type WbsItem = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  orderIndex: number;
  parentId: number | null; // ルートタスクはnull
};

// ツリー表示用の形。WbsItemの全フィールド＋自分の子供（同じ型の配列）。
// buildWbsTreeが、フラットなWbsItem[]からこの形を組み立てる。
export type WbsItemNode = WbsItem & {
  children: WbsItemNode[];
};

// 新規登録時に送る形。id・progress・orderIndexはサーバー側で決まる値
// （id自動採番、progressは0スタート、orderIndexも今は未使用）なので、
// フロントからは送らない。
export type WbsItemForCreate = Omit<WbsItem, "id" | "progress" | "orderIndex">;

// 更新時に送る形。idはURLパスに乗るので本文には不要。
// それ以外は全フィールド必須——PUTは部分更新ではなく丸ごと上書きなので、
// 送り忘れたフィールドはサーバー側でリセットされてしまう（WbsItemController参照）。
export type WbsItemForUpdate = Omit<WbsItem, "id">;
