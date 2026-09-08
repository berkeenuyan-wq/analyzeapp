/** Turkish-locale display formatting for the renderer (dot thousands, comma
 * decimal). Server-side formatting stays in `backend/domain/fmt.py`. */

const nf = (min: number, max: number): Intl.NumberFormat =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

export function formatNumber(
  value: number | null | undefined,
  decimals = 2,
): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return nf(decimals, decimals).format(value);
}
