export const daysBetween = (from: string, to: string): number => {
  const fromDay = new Date(from);
  const toDay = new Date(to);
  const diffMs = toDay.getTime() - fromDay.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};
