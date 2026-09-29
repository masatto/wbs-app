import type { WbsItem, WbsItemNode } from "../types/wbsItem";

// フラットなWbsItem[]（各要素がparentIdだけ持つ）を、
// 親子がネストしたWbsItemNode[]（ルートタスクの配列）に組み立てる。
// Mapを使った2段階の変換で、O(n)で親子関係を解決する。
export function buildWbsTree(items: WbsItem[]): WbsItemNode[] {
  const nodeMap = new Map<number, WbsItemNode>();
  const roots: WbsItemNode[] = [];

  //1回目：すべてのアイテムをノードに変換してMapに入れる
  items.forEach((item) => {
    const node: WbsItemNode = {
      ...item,
      children: [],
    };

    nodeMap.set(item.id, node);
  });

  //2回目：parentIdを確認して親子関係を設定する
  items.forEach((item) => {
    const node = nodeMap.get(item.id);

    if (!node) {
      return;
    }

    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parentNode = nodeMap.get(item.parentId);

      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return roots;
}
