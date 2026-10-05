import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16 calls "middleware" a "proxy". It redirects "/" to the visitor's language
// (browser setting on the first visit, then the saved choice).
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
