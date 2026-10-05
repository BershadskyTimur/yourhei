import type { InstitutionType } from './types';

/**
 * One icon per institution type (24x24 grid, drawn with strokes). The same paths are used
 * for the legend (SVG) and for the dots on the map (canvas), so they always match.
 * Icons are the second way, besides colour, to tell the types apart.
 */
export const TYPE_ICON_PATHS: Record<InstitutionType, string> = {
  // classical building with columns
  university: 'M3 10 12 4l9 6H3z M6 10v8 M10 10v8 M14 10v8 M18 10v8 M3 20h18',
  // open book
  college: 'M12 7c-1.5-1.5-4-2-7-2v12c3 0 5.5.5 7 2 1.5-1.5 4-2 7-2V5c-3 0-5.5.5-7 2z M12 7v12',
  // house with a door
  school: 'M4 11 12 4l8 7 M6 10v10h12V10 M10 20v-5h4v5',
  // speech bubble
  language_school: 'M4 5h16v11h-9l-4 4v-4H4z M8 9h8 M8 12h5',
  // stairs
  foundation: 'M3 20h5v-5h5v-5h5V5h3',
  // gear
  vocational:
    'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
};
