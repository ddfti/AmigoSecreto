export function normalizeExternalUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '#';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidProductUrl(rawUrl: string): boolean {
  const normalized = normalizeExternalUrl(rawUrl);
  if (normalized === '#') {
    return false;
  }
  try {
    const parsed = new URL(normalized);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export function formatCurrencyBRL(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value) || value <= 0) {
    return 'Consultar na loja';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function createGiftId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `gift-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `gift-${Date.now().toString(36)}`;
}
