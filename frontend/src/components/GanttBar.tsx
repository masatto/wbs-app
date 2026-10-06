import type { WbsItemNode } from "../types/wbsItem";
import { daysBetween, daysToPercent } from "../utils/dateMath";

type Props = {
  node: WbsItemNode;
  timelineStart: string;
  totalTimelineDays: number;
};

export const GanttBar = (props: Props) => {
  const { node, timelineStart, totalTimelineDays } = props;

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
  );
};
