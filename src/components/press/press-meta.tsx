/** "2025-11-20" / "2025-11" → "2025.11" */
export function formatPressDate(date: string): string {
  const [y, m] = date.split("-");
  return m ? `${y}.${m}` : y;
}
