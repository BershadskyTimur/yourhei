import type { ComponentProps } from 'react';
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware replacements for next/link and next/navigation helpers.
const navigation = createNavigation(routing);

/**
 * A link that does NOT load the next page in advance. By default Next.js fetches every visible link's page in the
 * background; with a menu, a footer and lists that is dozens of requests per page view, and on a hosting plan with
 * monthly limits that traffic is the first thing to run out. The page is fetched when the link is clicked instead.
 * A link that must be fast can still pass prefetch={true}.
 */
export function Link({ prefetch = false, ...props }: ComponentProps<typeof navigation.Link>) {
  return <navigation.Link prefetch={prefetch} {...props} />;
}

export const { redirect, usePathname, useRouter, getPathname } = navigation;
