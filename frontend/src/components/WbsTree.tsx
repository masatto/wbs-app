import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWbsItem, fetchWbsItems } from "../api/wbsItems";
import type { WbsItemNode } from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";

export const WbsTree = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteWbsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`「${node.name}」を本当に削除しますか？`)) {
      mutation.mutate(node.id);
    }
  };

  return (
    <li>
      {node.name}

      <button
        type="button"
        onClick={handleDelete}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "削除中…" : "削除"}
      </button>

      <ul>
        {node.children.map((child) => (
          <WbsTreeNode key={child.id} node={child} />
        ))}
      </ul>

      {mutation.isError && <p>削除に失敗しました：{mutation.error?.message}</p>}
    </li>
  );
};
