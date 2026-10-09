// A small CSV reader (quoted fields, doubled quotes, line breaks inside quotes). Returns rows as objects by header name;
// when a header repeats (the HECOS columns of Discover Uni), the later one gets a numeric suffix.
import { readFileSync } from 'node:fs';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function readCsv(file) {
  const rows = parseCsv(readFileSync(file, 'utf8').replace(/^﻿/, ''));
  const seen = {};
  const header = rows[0].map((h) => {
    seen[h] = (seen[h] ?? 0) + 1;
    return seen[h] > 1 ? `${h}${seen[h]}` : h;
  });
  return rows.slice(1).filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}
