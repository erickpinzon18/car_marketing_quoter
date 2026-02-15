export function formatMoney(num, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function parsePrice(str) {
  if (typeof str === 'number') return str;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
}

export function formatPriceInput(value) {
  let cleaned = value.replace(/[^\d.]/g, '');
  let parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 2) parts = [parts[0], parts.slice(1).join('')];
  if (parts[1] && parts[1].length > 2) parts[1] = parts[1].substring(0, 2);
  return parts.join('.');
}

export function splitMoneyParts(num) {
  const formatted = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
  }).format(num);
  const parts = formatted.split('.');
  return { integer: parts[0], decimals: parts[1] || '00' };
}
