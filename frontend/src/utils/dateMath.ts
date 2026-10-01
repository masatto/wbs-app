// "2026-10-01"のようなISO日付文字列2つの差分を日数で返す（toが後なら正の数）。
// Dateは直接引き算できないので、getTime()でミリ秒に変換してから引き算する。
export const daysBetween = (from: string, to: string): number => {
  const fromDay = new Date(from);
  const toDay = new Date(to);
  const diffMs = toDay.getTime() - fromDay.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};

// ISO日付文字列に日数を足して、またISO日付文字列で返す（daysBetweenの逆）。
// タイムラインの目盛り（ルーラー）で「起点からN日後の日付」を求めるのに使う。
export const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
