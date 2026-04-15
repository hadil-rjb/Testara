/** Sort order used by lists and tables. */
export type SortDirection = 'asc' | 'desc';

/** Pagination envelope returned by list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Standard API error shape from the NestJS backend. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** Shape for the toast helper used in the settings tabs. */
export type ToastKind = 'success' | 'error' | 'info' | 'warning';
