/** Programme cards list documents as "school_certificate" or "diploma"; the profile keeps one "education" document. */
export function profileDocType(programDoc: string): string {
  return programDoc === 'school_certificate' || programDoc === 'diploma' ? 'education' : programDoc;
}
