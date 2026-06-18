export function getApiErrorMessage(error: unknown, fallback = 'İşlem başarısız.'): string {
  const err = error as any;
  const body = err?.error;
  
  if (body) {
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail[0]?.msg ?? fallback;
    }
    if (body.errors && typeof body.errors === 'object') {
      const messages: string[] = [];
      for (const key in body.errors) {
        if (Array.isArray(body.errors[key]) && body.errors[key].length > 0) {
          messages.push(body.errors[key][0]);
        }
      }
      if (messages.length > 0) return messages.join(', ');
    }
    if (typeof body.title === 'string') return body.title;
  }
  
  return fallback;
}
