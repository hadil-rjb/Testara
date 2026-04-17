/**
 * Extract a human-readable message from an Axios error (or any unknown throw).
 * Falls back to `fallback` when the error shape is unrecognised.
 */
export function getApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (typeof err === 'string') return err;

  const axiosErr = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };

  const data = axiosErr?.response?.data?.message;
  if (Array.isArray(data)) return data[0] ?? fallback;
  if (typeof data === 'string' && data) return data;

  if (typeof axiosErr?.message === 'string' && axiosErr.message) {
    return axiosErr.message;
  }

  return fallback;
}
