'use client';

import { useTranslations } from 'next-intl';
import { openConsentSettings } from './ConsentBanner';

/** Footer link that opens the cookie choices again. */
export function ConsentSettingsLink() {
  const t = useTranslations('Consent');
  return (
    <button type="button" onClick={openConsentSettings} className="font-medium underline-offset-4 hover:underline">
      {t('settings')}
    </button>
  );
}
