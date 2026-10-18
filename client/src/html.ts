export const icon = (name: string, size = 18) =>
  `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}" width="${size}" height="${size}" aria-hidden="true"></i>`;
export const esc = (value: unknown) => String(value ?? '').replace(
  /[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
);
