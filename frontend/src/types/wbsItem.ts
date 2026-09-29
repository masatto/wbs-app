export type WbsItem = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  orderIndex: number;
  parentId: number | null;
};

export type WbsItemNode = WbsItem & {
  children: WbsItemNode[];
};

export type WbsItemForCreate = Omit<WbsItem, "id" | "progress" | "orderIndex">;

export type WbsItemForUpdate = Omit<WbsItem, "id">;
