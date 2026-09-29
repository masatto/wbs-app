// "2026-10-01"のようなISO日付文字列2つの差分を日数で返す（toが後なら正の数）。
// Dateは直接引き算できないので、getTime()でミリ秒に変換してから引き算する。
export const daysBetween = (from: string, to: string): number => {
  const fromDay = new Date(from);
  const toDay = new Date(to);
  const diffMs = toDay.getTime() - fromDay.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};
