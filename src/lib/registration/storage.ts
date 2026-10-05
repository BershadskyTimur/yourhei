import { emptyRegistration, type RegistrationForm } from './schema';

// Until the account exists, the answers live in this browser only, so a reload loses nothing
// (SPEC.md section 9). The password is never saved. Browser storage can be unavailable (private
// windows, blocked data), so every access is wrapped.
const KEY = 'yourhei.registration.v1';

export type RegistrationDraft = Omit<RegistrationForm, 'password'> & { step?: number };

export function loadDraft(): { values: RegistrationForm; step: number } | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const { step, ...saved } = JSON.parse(raw) as Partial<RegistrationDraft>;
    return { values: { ...emptyRegistration(), ...saved, password: '' }, step: step ?? 0 };
  } catch {
    return null;
  }
}

export function saveDraft(values: RegistrationForm, step: number): void {
  try {
    const withoutPassword = Object.fromEntries(Object.entries(values).filter(([key]) => key !== 'password'));
    window.localStorage.setItem(KEY, JSON.stringify({ ...withoutPassword, step }));
  } catch {
    // nothing to do: the form still works, it just cannot remember
  }
}

/** Removes everything, e.g. after sign-up or when the person is below the minimum age. */
export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
