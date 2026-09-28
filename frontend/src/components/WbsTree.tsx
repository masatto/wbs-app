import { useQuery } from "@tanstack/react-query";
import type { WbsItem, WbsItemNode } from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";

async function fetchWbsItem(): Promise<WbsItem[]> {
  const response = await fetch("http://localhost:8080/api/wbs-items");

  if (!response.ok) {
    throw new Error(`HTTP Error:${response.status}`);
  }

  return response.json();
}

export const WbsTree = () => {
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
      {buildWbsTree(data).map((rootNode) => (
        <WbsTreeNode key={rootNode.id} node={rootNode} />
      ))}
    </ul>
  );
};

type Props = {
  node: WbsItemNode;
};

export const WbsTreeNode = ({ node }: Props) => {
  return (
    <li>
      {node.name}

      <ul>
        {node.children.map((child) => (
          <WbsTreeNode key={child.id} node={child} />
        ))}
      </ul>
    </li>
  );
};
