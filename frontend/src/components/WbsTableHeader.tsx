import { addDays, daysBetween } from "../utils/dateMath";

type Props = {
  totalTimelineDays: number;
  earliestStartDate: string;
  latestEndDate: string;
};

export const WbsTableHeader = (props: Props) => {
  const { totalTimelineDays, earliestStartDate, latestEndDate } = props;
  // タイムラインの目盛りに何個ラベルを出すか。
  const TICK_COUNT = 4;

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
      </div>{" "}
    </>
  );
};
