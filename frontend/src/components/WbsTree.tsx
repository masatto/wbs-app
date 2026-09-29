import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteWbsItem, fetchWbsItems } from "../api/wbsItems";
import type { WbsItemNode } from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";
import { daysBetween } from "../utils/dateMath";
import { WbsItemEditForm } from "./WbsItemEditForm";

// タスク一覧の取得と、ツリー全体の描画。
// ガントチャートの基準になる「タイムラインの全体日数」もここで一度だけ
// 計算し、WbsTreeNodeに再帰で渡していく。
export const WbsTree = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
  });

  if (isPending) {
    return <p className="wbs-loading">読み込み中…</p>;
  }

  if (isError) {
    return <p className="wbs-error">{error.message}</p>;
  }

  if (data.length === 0) {
    return <p className="wbs-empty">登録されていません</p>;
  }

  // ISO形式の日付文字列（"2026-10-01"）は、桁数が揃っているので
  // 文字列のまま比較しても時系列順になる。Dateに変換しなくてよい。
  const earliestStartDate = data.reduce((earliest, item) => {
    return item.startDate < earliest ? item.startDate : earliest;
  }, data[0].startDate);

  const latestEndDate = data.reduce((latest, item) => {
    return item.endDate > latest ? item.endDate : latest;
  }, data[0].endDate);

  // ガントバーの位置・幅は「全体日数に対する割合(%)」で決める
  // （固定px/日だと、長い期間のタスクがトラックからはみ出してしまうため）。
  // 全タスクが同じ日だと0除算になるので、その場合は1として扱う。
  const rawDays = daysBetween(earliestStartDate, latestEndDate);
  const totalTimelineDays = rawDays === 0 ? 1 : rawDays;

  return (
    <ul className="wbs-tree">
      {buildWbsTree(data).map((rootNode) => (
        <WbsTreeNode
          key={rootNode.id}
          node={rootNode}
          timelineStart={earliestStartDate}
          totalTimelineDays={totalTimelineDays}
          depth={0}
        />
      ))}
    </ul>
  );
};

type Props = {
  node: WbsItemNode;
  timelineStart: string; // タイムライン全体の起点（一番早いstartDate）
  totalTimelineDays: number; // タイムライン全体の日数（%計算の分母）
  depth: number; // ツリーの深さ（0=ルート）。名前の字下げにだけ使う
};

// 1タスク分の行。自分自身を再帰的に呼び出して子タスクを描画する
// （子タスクがいなければchildren=[]なので、.map()が何も生成せず自然に
// 再帰が止まる）。
//
// timelineStart・totalTimelineDays・depthは全階層で共通の値だが、
// propsとしてバケツリレー式に子へ渡し続けている（React Contextは
// まだ使っていない）。
export const WbsTreeNode = (props: Props) => {
  const { node, timelineStart, totalTimelineDays, depth } = props;
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteWbsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`「${node.name}」を本当に削除しますか？`)) {
      deleteMutation.mutate(node.id);
    }
  };

  // ガントバーの位置（左端からのオフセット日数）と長さ（日数）。
  // %計算はJSXの中でtotalTimelineDaysを使って行う。
  const offsetDays = daysBetween(timelineStart, node.startDate);
  const durationDays = daysBetween(node.startDate, node.endDate);

  return (
    <li>
      {isEditing ? (
        <WbsItemEditForm
          node={node}
          onClose={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <div className="wbs-node">
          {/* 字下げは名前側だけに付ける。バー側に付けると、階層が深い
              タスクほど日付と無関係に右へズレてしまい、ガントチャート
              として比較にならなくなる（実際に一度そのバグを踏んだ）。 */}
          <div className="wbs-node-name" style={{ paddingLeft: depth * 16 }}>
            {node.name}
          </div>
          <div className="wbs-bar-track">
            {/* left/widthは%指定。.wbs-bar-trackがposition:relativeなので
                「トラック全体の幅に対する割合」として解釈される。
                これで画面幅やタイムラインの長さが変わっても自動で収まる。 */}
            <div
              className="wbs-bar-fill"
              style={{
                left: `${(offsetDays / totalTimelineDays) * 100}%`,
                width: `${(durationDays / totalTimelineDays) * 100}%`,
              }}
            >
              {/* 進捗（0〜100）をバーの中にさらに重ねて表示する */}
              <div
                className="wbs-bar-progress"
                style={{ width: `${node.progress}%` }}
              />
            </div>
          </div>
          <div className="wbs-node-actions">
            <button
              type="button"
              className="wbs-btn wbs-btn-sm"
              onClick={() => setIsEditing(true)}
            >
              編集
            </button>
            <button
              type="button"
              className="wbs-btn wbs-btn-danger wbs-btn-sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "削除中…" : "削除"}
            </button>
          </div>
        </div>
      )}
      <ul className="wbs-children">
        {node.children.map((child) => (
          <WbsTreeNode
            key={child.id}
            node={child}
            timelineStart={timelineStart}
            totalTimelineDays={totalTimelineDays}
            depth={depth + 1}
          />
        ))}
      </ul>

      {deleteMutation.isError && (
        <p className="wbs-error">
          削除に失敗しました：{deleteMutation.error?.message}
        </p>
      )}
    </li>
  );
};
