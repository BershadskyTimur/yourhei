import en from '../messages/en.json';

// Makes translation keys type-checked: a typo in t('...') becomes a build error.
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof en;
  }
}
