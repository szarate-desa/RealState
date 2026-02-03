export function formatPrice(price: number, locale: string = 'es-ES', currency: string = 'PYG'): string {
  if (typeof price !== 'number' || !Number.isFinite(price)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}
