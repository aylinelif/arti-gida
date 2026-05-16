export function getApiErrorMessage(error: unknown, fallback = 'İşlem başarısız.'): string {
  const err = error as { error?: { detail?: string | { msg?: string }[] } };
  const detail = err?.error?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0]?.msg ?? fallback;
  }
  return fallback;
}
