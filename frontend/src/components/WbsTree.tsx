import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchWbsItemDependencies } from "../api/wbsItemDependencies";
import { deleteWbsItem, fetchWbsItems, putWbsItem } from "../api/wbsItems";
import {
  WBS_ITEM_PRIORITY_LABEL,
  WBS_ITEM_STATUS_LABEL,
  type WbsItem,
  type WbsItemDependency,
  type WbsItemNode,
} from "../types/wbsItem";
import { buildWbsTree } from "../utils/buildWbsTree";
import { addDays, daysBetween, daysToPercent } from "../utils/dateMath";
import { WbsItemEditForm } from "./WbsItemEditForm";

// タイムラインの目盛りに何個ラベルを出すか。
const TICK_COUNT = 4;

// あるノード自身と、その子孫すべての件数を数える（削除確認の文言用）。
function countDescendants(node: WbsItemNode): number {
  return node.children.reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0,
  );
}

// タスク一覧の取得と、ツリー全体の描画。
// ガントチャートの基準になる「タイムラインの全体日数」もここで一度だけ
// 計算し、WbsTreeNodeに再帰で渡していく。
//
// 表示はCSS Gridで組んだ「表」。.wbs-tableに1つのgrid-template-columnsを
// 定義し、ヘッダー行・各タスク行の全セルがそこに直接所属する（<ul>/<li>は
// display:contentsにして、レイアウト上は透明な存在にする）。これにより、
// 再帰で描画した親子構造をそのまま保ちながら、見た目は1タスク＝1行の
// テーブルになる。タイムラインの目盛りも最後の列（スケジュール列）に
// 置くことで、バーの位置と目盛りの位置が確実に一致する。
export const WbsTree = () => {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["wbsItems"],
    queryFn: fetchWbsItems,
  });

  // 先行タスクの表示用。WbsItemEditFormと同じqueryKeyなので
  // キャッシュを共有する（編集で追加・削除すればここも自動で更新される）。
  const { data: dependencies } = useQuery({
    queryKey: ["wbsItemDependencies"],
    queryFn: fetchWbsItemDependencies,
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

  // タイムライン全体を等間隔に区切って、目盛りに出す日付を求める。
  // 例：TICK_COUNT=6なら、0%・20%・40%・60%・80%・100%の位置の日付。
  const tickDates = Array.from({ length: TICK_COUNT }, (_, i) => {
    const dayOffset = Math.round((totalTimelineDays * i) / (TICK_COUNT - 1));
    return addDays(earliestStartDate, dayOffset);
  });

  // 「今日」の位置。タイムラインの範囲外（まだ始まっていない/とっくに
  // 終わっている）なら表示しない。
  const todayStr = new Date().toISOString().slice(0, 10);
  const showTodayMarker =
    todayStr >= earliestStartDate && todayStr <= latestEndDate;
  const todayPositionPercent =
    (daysBetween(earliestStartDate, todayStr) / totalTimelineDays) * 100;

  const rootNodes = buildWbsTree(data);

  return (
    <>
      {/* ガントバーの色分けを一度だけ説明する凡例。行ごとに繰り返さない。 */}
      <div className="wbs-legend">
        <span className="wbs-legend-item">
          <span className="wbs-legend-swatch wbs-legend-swatch-plan" />
          計画期間
        </span>
        <span className="wbs-legend-item">
          <span className="wbs-legend-swatch wbs-legend-swatch-actual" />
          実績期間
        </span>
        <span className="wbs-legend-item">
          <span className="wbs-legend-swatch wbs-legend-swatch-today" />
          今日
        </span>
      </div>

      <div className="wbs-table">
        {/* ヘッダー行（7セル）。最後のセルにタイムラインの目盛りを置く。 */}
        <div className="wbs-cell wbs-cell-head">タスク名</div>
        <div className="wbs-cell wbs-cell-head">担当者</div>
        <div className="wbs-cell wbs-cell-head">ステータス</div>
        <div className="wbs-cell wbs-cell-head">優先度</div>
        <div className="wbs-cell wbs-cell-head">進捗</div>
        <div className="wbs-cell wbs-cell-head">操作</div>
        <div className="wbs-cell wbs-cell-head wbs-cell-timeline">
          {/* 日付の目盛り。各バーと同じ%基準で位置決めしているので、
              目盛りの位置とバーの位置が対応する。 */}
          <div className="wbs-timeline-ruler">
            {tickDates.map((date, i) => (
              <span
                key={i}
                className="wbs-timeline-tick"
                style={{
                  left: `${(i / (TICK_COUNT - 1)) * 100}%`,
                  transform:
                    i === 0
                      ? "none"
                      : i === TICK_COUNT - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {/* 年を省略してMM-DDだけ表示（重なり対策で文字数を減らす）。
                    ISO形式（"2026-09-01"）の6文字目以降がMM-DDにあたる。 */}
                {date.slice(5)}
              </span>
            ))}
            {showTodayMarker && (
              <span
                className="wbs-today-tick"
                style={{
                  left: `${todayPositionPercent}%`,
                  transform: "translateX(-50%)",
                }}
                title={`今日：${todayStr}`}
              >
                今日
              </span>
            )}
          </div>
        </div>

        <ul className="wbs-tree">
          {rootNodes.map((rootNode) => (
            <WbsTreeNode
              key={rootNode.id}
              node={rootNode}
              siblings={rootNodes}
              timelineStart={earliestStartDate}
              totalTimelineDays={totalTimelineDays}
              allTasks={data}
              dependencies={dependencies ?? []}
              depth={0}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

type Props = {
  node: WbsItemNode;
  siblings: WbsItemNode[]; // 同じ階層の兄弟（自分を含む）。並び替えボタンで使う
  timelineStart: string; // タイムライン全体の起点（一番早いstartDate）
  totalTimelineDays: number; // タイムライン全体の日数（%計算の分母）
  allTasks: WbsItem[]; // 先行タスクのid→名前解決に使う、全タスクのフラットな一覧
  dependencies: WbsItemDependency[]; // 先行タスクの関連データ（全タスク分）
  depth: number; // ツリーの深さ（0=ルート）。名前の字下げにだけ使う
};

// 1タスク分の行。自分自身を再帰的に呼び出して子タスクを描画する
// （子タスクがいなければchildren=[]なので、.map()が何も生成せず自然に
// 再帰が止まる）。
//
// timelineStart・totalTimelineDays・depthは全階層で共通の値だが、
// propsとしてバケツリレー式に子へ渡し続けている（React Contextは
// まだ使っていない）。
//
// <li>はdisplay:contentsなので、実際に描画する7つの.wbs-cellが
// 親の.wbs-tableグリッドに直接所属し、1行として扱われる。
export const WbsTreeNode = (props: Props) => {
  const {
    node,
    siblings,
    timelineStart,
    totalTimelineDays,
    allTasks,
    dependencies,
    depth,
  } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasChildren = node.children.length > 0;

  // このタスクの先行タスクの「名前」一覧（表示用）。
  // 依存関係データ（predecessorIdだけ持つ）を、名前に解決する。
  const predecessorNames = dependencies
    .filter((dependency) => dependency.taskId === node.id)
    .map(
      (dependency) =>
        allTasks.find((task) => task.id === dependency.predecessorId)?.name,
    )
    .filter((name): name is string => name !== undefined);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteWbsItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const handleDelete = () => {
    const descendantCount = countDescendants(node);
    const message =
      descendantCount > 0
        ? `「${node.name}」を削除します。子タスクも含めて合計${
            descendantCount + 1
          }件削除されます。よろしいですか？`
        : `「${node.name}」を本当に削除しますか？`;

    if (window.confirm(message)) {
      deleteMutation.mutate(node.id);
    }
  };

  // 兄弟内での並び替え。orderIndexをいじるのではなく、兄弟全員の
  // 並び順を入れ替えてから0, 1, 2...で振り直す（元の値がバラバラでも
  // 必ず矛盾のない順序になる）。
  const reorderMutation = useMutation({
    mutationFn: async (reordered: WbsItemNode[]) => {
      await Promise.all(
        reordered.map((sibling, index) => {
          const { id, children: _children, ...rest } = sibling;
          return putWbsItem(id, { ...rest, orderIndex: index });
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wbsItems"] });
    },
  });

  const siblingIndex = siblings.findIndex((sibling) => sibling.id === node.id);
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblingIndex < siblings.length - 1;

  const handleMoveUp = () => {
    if (!canMoveUp) {
      return;
    }
    const reordered = [...siblings];
    [reordered[siblingIndex - 1], reordered[siblingIndex]] = [
      reordered[siblingIndex],
      reordered[siblingIndex - 1],
    ];
    reorderMutation.mutate(reordered);
  };

  const handleMoveDown = () => {
    if (!canMoveDown) {
      return;
    }
    const reordered = [...siblings];
    [reordered[siblingIndex], reordered[siblingIndex + 1]] = [
      reordered[siblingIndex + 1],
      reordered[siblingIndex],
    ];
    reorderMutation.mutate(reordered);
  };

  // ガントバーの位置（左端からのオフセット日数）と長さ（日数）。
  // %計算はJSXの中でtotalTimelineDaysを使って行う。
  const offsetDays = daysBetween(timelineStart, node.startDate);
  const durationDays = daysBetween(node.startDate, node.endDate);

  const actualOffsetDays =
    node.actualStartDate !== null
      ? daysBetween(timelineStart, node.actualStartDate)
      : null;

  const actualDurationDays =
    node.actualStartDate !== null && node.actualEndDate !== null
      ? daysBetween(node.actualStartDate, node.actualEndDate)
      : null;

  return (
    <li>
      {isEditing ? (
        // WbsItemEditForm自身が表示モードと同じ7列のセルを直接描画する
        // ので、ここでは何も包まない（同じ<li>の直接の子として並べる）。
        <WbsItemEditForm
          node={node}
          onClose={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div
            className="wbs-cell wbs-cell-name"
            style={{ paddingLeft: depth * 20 }}
            title={`${node.name}\n${node.startDate}~${node.endDate}${
              node.effortDays !== null ? ` ／ ${node.effortDays}人日` : ""
            }`}
          >
            {/* 折りたたみの▶/▼ボタン。子を持たないタスクには出さないが、
                字下げの位置を揃えるため同じ幅のスペースを確保する。 */}
            {hasChildren ? (
              <button
                type="button"
                className="wbs-collapse-toggle"
                onClick={() => setIsCollapsed((collapsed) => !collapsed)}
              >
                {isCollapsed ? "▶" : "▼"}
              </button>
            ) : (
              <span className="wbs-collapse-toggle-spacer" />
            )}
            {depth > 0 && <span className="wbs-node-connector">└</span>}
            {node.name}
            {node.notes && (
              <span className="wbs-notes-icon" title={node.notes}>
                📝
              </span>
            )}
            {node.category && (
              <span className="wbs-badge">{node.category}</span>
            )}
            {predecessorNames.length > 0 && (
              <span
                className="wbs-predecessor-note"
                title={`先行タスク：${predecessorNames.join(", ")}`}
              >
                先行: {predecessorNames.join(", ")}
              </span>
            )}
          </div>
          <div className="wbs-cell">{node.assignee}</div>
          <div className="wbs-cell">
            <span className="wbs-badge">
              {WBS_ITEM_STATUS_LABEL[node.status]}
            </span>
          </div>
          <div className="wbs-cell">
            <span className="wbs-badge">
              {WBS_ITEM_PRIORITY_LABEL[node.priority]}
            </span>
          </div>
          <div className="wbs-cell">{`${node.progress}%`}</div>
          <div className="wbs-cell wbs-cell-actions">
            <div className="wbs-reorder-buttons">
              <button
                type="button"
                className="wbs-btn wbs-btn-sm wbs-btn-icon"
                onClick={handleMoveUp}
                disabled={!canMoveUp || reorderMutation.isPending}
                title="上に移動"
              >
                ↑
              </button>
              <button
                type="button"
                className="wbs-btn wbs-btn-sm wbs-btn-icon"
                onClick={handleMoveDown}
                disabled={!canMoveDown || reorderMutation.isPending}
                title="下に移動"
              >
                ↓
              </button>
            </div>
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
          <div className="wbs-cell wbs-cell-timeline">
            <div className="wbs-bar-track">
              {/* left/widthは%指定。.wbs-bar-trackがposition:relativeなので
                  「トラック全体の幅に対する割合」として解釈される。
                  これで画面幅やタイムラインの長さが変わっても自動で収まる。 */}
              {node.milestone ? (
                <span
                  className="wbs-milestone-marker"
                  style={{
                    left: `${daysToPercent(offsetDays, totalTimelineDays)}%`,
                  }}
                  title={`マイルストーン：${node.startDate}`}
                >
                  ◆
                </span>
              ) : (
                <>
                  <div
                    className="wbs-bar-fill"
                    title={`計画期間：${node.startDate}~${node.endDate}`}
                    style={{
                      left: `${daysToPercent(offsetDays, totalTimelineDays)}%`,
                      width: `${daysToPercent(durationDays, totalTimelineDays)}%`,
                    }}
                  />
                  {actualOffsetDays !== null && actualDurationDays !== null && (
                    <div
                      className="wbs-bar-actual"
                      title={`実績期間：${node.actualStartDate}~${node.actualEndDate}`}
                      style={{
                        left: `${daysToPercent(actualOffsetDays, totalTimelineDays)}%`,
                        width: `${daysToPercent(actualDurationDays, totalTimelineDays)}%`,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {deleteMutation.isError && (
        <div className="wbs-cell wbs-cell-edit">
          <p className="wbs-error">
            削除に失敗しました：{deleteMutation.error?.message}
          </p>
        </div>
      )}

      {reorderMutation.isError && (
        <div className="wbs-cell wbs-cell-edit">
          <p className="wbs-error">
            並び替えに失敗しました：{reorderMutation.error?.message}
          </p>
        </div>
      )}

      {/* 折りたたみ中は子タスクの行自体を描画しない。 */}
      {!isCollapsed && (
        <ul className="wbs-children">
          {node.children.map((child) => (
            <WbsTreeNode
              key={child.id}
              node={child}
              siblings={node.children}
              timelineStart={timelineStart}
              totalTimelineDays={totalTimelineDays}
              allTasks={allTasks}
              dependencies={dependencies}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
