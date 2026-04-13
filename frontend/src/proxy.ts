import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlProxy = createMiddleware(routing);

export function proxy(request: any) {
  return intlProxy(request);
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
};
