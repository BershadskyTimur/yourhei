import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SHARED_CLIENT_NAMESPACES, pickMessages } from './pick-messages';

/**
 * Gives the browser components inside it their interface texts: the groups every page has plus the named ones.
 * Without `namespaces` it is the provider of the whole site (see the layout). See pick-messages.ts for the reason.
 */
export async function ClientMessages({ namespaces = [], children }: { namespaces?: readonly string[]; children: ReactNode }) {
  const messages = pickMessages(await getMessages(), [...SHARED_CLIENT_NAMESPACES, ...namespaces]);
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
