import lisbon from '../../../data/reference/lisbon-convention.json';

// Will a degree from the study country be recognised at home? When both countries are parties to the Lisbon Recognition
// Convention, a foreign degree must be recognised unless a substantial difference is shown: that is a clear "yes".
// Otherwise nothing is claimed (other agreements may exist): the answer is unknown, never "no".
const PARTIES = new Set((lisbon as { parties: string[] }).parties);

/** true when the study country and at least one of the home countries are parties to the convention, else null (unknown). */
export function lisbonRecognition(studyCountry: string, homeCountries: readonly string[]): true | null {
  return PARTIES.has(studyCountry) && homeCountries.some((c) => PARTIES.has(c)) ? true : null;
}
