// Builds data/generated/turkey.json: programmes of four Turkish universities, copied (names only) from the official pages
// of the universities, checked on 2026-10-22. Nothing else is filled in (no fees, no dates): the official pages used
// do not state them, and DATA_COLLECTION.md says an empty value is better than an invented one.
// The portal studyinturkiye.gov.tr blocks automated requests, so it is not used.
// Load into the database with: node scripts/load-programs.mjs data/generated/turkey.json   (needs the service key)
// Run: node scripts/build-turkey.mjs
import { writeFileSync } from 'node:fs';
import { inferIsced } from './lib/isced-infer.mjs';

const KEY = 'tr_university_sites';

// The field (ISCED-F 2013, 3 digits) of programmes whose names the keyword list does not recognise: a classification
// made by us from the programme name, not a statement of the university.
const FIELD_BY_NAME = {
  'City and Regional Planning': '073',
  'Political Science and Public Administration': '031',
  'Computer Education and Instructional Technology': '011',
  'Computer Education and Educational Technology': '011',
  'Elementary Science Education': '011',
  'Educational Sciences': '011',
  'Elementary Education': '011',
  'Foreign Language Education': '011',
  'Geological Engineering': '071',
  'Petroleum and Natural Gas Engineering': '071',
  'Western Languages and Literatures': '023',
  'Data Science and Analytics': '061',
};

/** [name, official page of the programme or of the list] */
const universities = [
  {
    slug: 'middle-east-technical-university',
    names: { original: 'Orta Doğu Teknik Üniversitesi', en: 'Middle East Technical University' },
    city: 'Ankara', lat: 39.88567, lng: 32.78403,
    website: 'https://www.metu.edu.tr/',
    // METU states: "The language of instruction at METU is English." (https://www.metu.edu.tr/general-information)
    languages: ['en'],
    list: 'https://www.metu.edu.tr/undergraduate-programs-and-degrees',
    programs: [
      ['Architecture', 'Faculty of Architecture', 120], ['City and Regional Planning', 'Faculty of Architecture', 121], ['Industrial Design', 'Faculty of Architecture', 125],
      ['Biology', 'Faculty of Arts and Sciences', 238], ['Chemistry', 'Faculty of Arts and Sciences', 234], ['History', 'Faculty of Arts and Sciences', 240],
      ['Mathematics', 'Faculty of Arts and Sciences', 236], ['Molecular Biology and Genetics', 'Faculty of Arts and Sciences', 219], ['Philosophy', 'Faculty of Arts and Sciences', 241],
      ['Physics', 'Faculty of Arts and Sciences', 230], ['Psychology', 'Faculty of Arts and Sciences', 233], ['Sociology', 'Faculty of Arts and Sciences', 232], ['Statistics', 'Faculty of Arts and Sciences', 246],
      ['Business Administration', 'Faculty of Economic and Administrative Sciences', 312], ['Economics', 'Faculty of Economic and Administrative Sciences', 311],
      ['International Relations', 'Faculty of Economic and Administrative Sciences', 314], ['Political Science and Public Administration', 'Faculty of Economic and Administrative Sciences', 310],
      ['Chemistry Education', 'Faculty of Education', 422], ['Computer Education and Instructional Technology', 'Faculty of Education', 430], ['Early Childhood Education', 'Faculty of Education', 411],
      ['Elementary Mathematics Education', 'Faculty of Education', 413], ['Elementary Science Education', 'Faculty of Education', 412], ['English Language Teaching', 'Faculty of Education', 450],
      ['Mathematics Education', 'Faculty of Education', 423], ['Physics Education', 'Faculty of Education', 421], ['Physical Education and Sports', 'Faculty of Education', 453],
      ['Aerospace Engineering', 'Faculty of Engineering', 572], ['Chemical Engineering', 'Faculty of Engineering', 563], ['Civil Engineering', 'Faculty of Engineering', 562],
      ['Computer Engineering', 'Faculty of Engineering', 571], ['Electrical and Electronics Engineering', 'Faculty of Engineering', 567], ['Environmental Engineering', 'Faculty of Engineering', 560],
      ['Food Engineering', 'Faculty of Engineering', 573], ['Geological Engineering', 'Faculty of Engineering', 564], ['Industrial Engineering', 'Faculty of Engineering', 568],
      ['Mechanical Engineering', 'Faculty of Engineering', 569], ['Metallurgical and Materials Engineering', 'Faculty of Engineering', 570], ['Mining Engineering', 'Faculty of Engineering', 565],
      ['Petroleum and Natural Gas Engineering', 'Faculty of Engineering', 566],
    ].map(([name, faculty, id]) => ({ name, faculty, url: `https://catalog.metu.edu.tr/program.php?fac_prog=${id}` })),
    // The campus in Northern Cyprus and the joint programmes with American universities are not included.
  },
  {
    slug: 'bogazici-university',
    names: { original: 'Boğaziçi Üniversitesi', en: 'Boğaziçi University' },
    city: 'Istanbul', lat: 41.08356, lng: 29.0506,
    website: 'https://bogazici.edu.tr/',
    // Official page "The University": the language of instruction at BU is English (https://bogazici.edu.tr/en/pages/the-university/567)
    languages: ['en'],
    list: 'https://bogazici.edu.tr/en/pages/undergraduate-programs/434',
    programs: [
      ['Computer Education and Educational Technology', 'Faculty of Education', 604], ['Educational Sciences', 'Faculty of Education', 605], ['Elementary Education', 'Faculty of Education', 606],
      ['Mathematics and Science Education', 'Faculty of Education', 607], ['Foreign Language Education', 'Faculty of Education', 608],
      ['Physics', 'Faculty of Science', 614], ['Chemistry', 'Faculty of Science', 615], ['Mathematics', 'Faculty of Science', 616], ['Molecular Biology and Genetics', 'Faculty of Science', 617],
      ['Economics', 'Faculty of Economics and Administrative Sciences', 626], ['Management', 'Faculty of Economics and Administrative Sciences', 627],
      ['Political Science and International Relations', 'Faculty of Economics and Administrative Sciences', 628], ['Tourism Administration', 'Faculty of Economics and Administrative Sciences', 637],
      ['International Trade', 'Faculty of Economics and Administrative Sciences', 638], ['Management Information Systems', 'Faculty of Economics and Administrative Sciences', 639],
      ['Computer Engineering', 'Faculty of Engineering', 630], ['Electrical and Electronics Engineering', 'Faculty of Engineering', 631], ['Industrial Engineering', 'Faculty of Engineering', 632],
      ['Civil Engineering', 'Faculty of Engineering', 633], ['Chemical Engineering', 'Faculty of Engineering', 634], ['Mechanical Engineering', 'Faculty of Engineering', 635],
      ['Western Languages and Literatures', 'Faculty of Humanities and Social Sciences', 610], ['Translation and Interpreting Studies', 'Faculty of Humanities and Social Sciences', 611],
      ['Linguistics', 'Faculty of Humanities and Social Sciences', 612], ['Philosophy', 'Faculty of Humanities and Social Sciences', 613], ['Psychology', 'Faculty of Humanities and Social Sciences', 618],
      ['Sociology', 'Faculty of Humanities and Social Sciences', 619], ['History', 'Faculty of Humanities and Social Sciences', 620],
    ].map(([name, faculty, id]) => ({ name, faculty, url: `https://bogazici.edu.tr/en/pages/lisans-programlari/${id}` })),
    // Not included: Turkish Language and Literature (the language of its teaching is not stated), the coordinatorships and the language units.
  },
  {
    slug: 'bilkent-university',
    names: { original: 'Bilkent Üniversitesi', en: 'Bilkent University' },
    city: 'Ankara', lat: 39.86735, lng: 32.75077,
    website: 'https://w3.bilkent.edu.tr/bilkent/',
    // Official page "English Language Proficiency": the medium of instruction at Bilkent is English; the Faculty of Law, the Faculty of
    // Music and Performing Arts and the Fine Arts department teach at least 30% in English, so those are left out.
    languages: ['en'],
    list: 'https://w3.bilkent.edu.tr/international/undergraduate-programs/',
    programs: [
      ['Architecture', 'Faculty of Art, Design and Architecture', 'http://catalog.bilkent.edu.tr/current/dep/d70.html'],
      ['Communication and Design', 'Faculty of Art, Design and Architecture', 'http://catalog.bilkent.edu.tr/current/dep/d77.html'],
      ['Graphic Design', 'Faculty of Art, Design and Architecture', 'http://catalog.bilkent.edu.tr/current/dep/d72.html'],
      ['Interior Architecture and Environmental Design', 'Faculty of Art, Design and Architecture', 'http://catalog.bilkent.edu.tr/current/dep/d71.html'],
      ['Urban Design and Landscape Architecture', 'Faculty of Art, Design and Architecture', 'http://catalog.bilkent.edu.tr/current/dep/d75.html'],
      ['Management', 'Faculty of Business Administration', 'http://catalog.bilkent.edu.tr/current/dep/d31.html'],
      ['Economics', 'Faculty of Economics, Administrative and Social Sciences', 'http://catalog.bilkent.edu.tr/current/dep/d32.html'],
      ['International Relations', 'Faculty of Economics, Administrative and Social Sciences', 'http://catalog.bilkent.edu.tr/current/dep/d33.html'],
      ['Political Science and Public Administration', 'Faculty of Economics, Administrative and Social Sciences', 'http://catalog.bilkent.edu.tr/current/dep/d34.html'],
      ['Psychology', 'Faculty of Economics, Administrative and Social Sciences', 'http://catalog.bilkent.edu.tr/current/dep/d92.html'],
      ['Computer Engineering', 'Faculty of Engineering', 'http://catalog.bilkent.edu.tr/current/dep/d11.html'],
      ['Electrical and Electronics Engineering', 'Faculty of Engineering', 'http://catalog.bilkent.edu.tr/current/dep/d12.html'],
      ['Industrial Engineering', 'Faculty of Engineering', 'http://catalog.bilkent.edu.tr/current/dep/d13.html'],
      ['Mechanical Engineering', 'Faculty of Engineering', 'http://www.me.bilkent.edu.tr/'],
      ['American Culture and Literature', 'Faculty of Humanities and Letters', 'http://catalog.bilkent.edu.tr/current/dep/d22.html'],
      ['Archaeology', 'Faculty of Humanities and Letters', 'http://catalog.bilkent.edu.tr/current/dep/d23.html'],
      ['English Language and Literature', 'Faculty of Humanities and Letters', 'http://catalog.bilkent.edu.tr/current/dep/d21.html'],
      ['Philosophy', 'Faculty of Humanities and Letters', 'http://catalog.bilkent.edu.tr/current/dep/d25.html'],
      ['Chemistry', 'Faculty of Science', 'http://catalog.bilkent.edu.tr/current/dep/d02.html'],
      ['Mathematics', 'Faculty of Science', 'http://catalog.bilkent.edu.tr/current/dep/d03.html'],
      ['Molecular Biology and Genetics', 'Faculty of Science', 'http://catalog.bilkent.edu.tr/current/dep/d04.html'],
      ['Physics', 'Faculty of Science', 'http://catalog.bilkent.edu.tr/current/dep/d01.html'],
      ['Information Systems and Technologies', 'Faculty of Applied Sciences', 'https://catalog.bilkent.edu.tr/dep/d18.html'],
      ['Tourism and Hotel Management', 'Faculty of Applied Sciences', 'https://catalog.bilkent.edu.tr/dep/d19.html'],
    ].map(([name, faculty, url]) => ({ name, faculty, url })),
  },
  {
    slug: 'sabanc-university',
    names: { original: 'Sabancı Üniversitesi', en: 'Sabancı University' },
    city: 'Istanbul', lat: 40.89055, lng: 29.37839,
    website: 'https://www.sabanciuniv.edu/en',
    // Official page "School of Languages": the medium of instruction at Sabancı University is English.
    languages: ['en'],
    list: 'https://iro.sabanciuniv.edu/en/all-programs',
    // 12 of the 13 undergraduate programmes shown on the page were read; the list is not complete.
    programs: [
      ['Computer Science and Engineering', 'Faculty of Engineering and Natural Sciences'], ['Economics', 'Faculty of Arts and Social Sciences'],
      ['Electronics Engineering', 'Faculty of Engineering and Natural Sciences'], ['Data Science and Analytics', 'Faculty of Engineering and Natural Sciences'],
      ['Industrial Engineering', 'Faculty of Engineering and Natural Sciences'], ['Management', 'Sabancı Business School'],
      ['Materials Science and Nano Engineering', 'Faculty of Engineering and Natural Sciences'], ['Mechatronics Engineering', 'Faculty of Engineering and Natural Sciences'],
      ['Molecular Biology, Genetics and Bioengineering', 'Faculty of Engineering and Natural Sciences'], ['Political Science and International Relations', 'Faculty of Arts and Social Sciences'],
      ['Psychology', 'Faculty of Arts and Social Sciences'], ['Visual Arts and Visual Communication Design', 'Faculty of Arts and Social Sciences'],
    ].map(([name, faculty]) => ({ name, faculty, url: 'https://iro.sabanciuniv.edu/en/all-programs' })),
  },
];

const institutions = universities.map((u) => ({
  externalIds: { [KEY]: u.slug },
  slug: u.slug,
  existing: true,
  country: 'TR',
  type: 'university',
  names: u.names,
  city: { en: u.city },
  lat: u.lat,
  lng: u.lng,
  website: u.website,
  ownership: null,
  size: null,
  programs: u.programs.map((p) => ({
    names: { original: p.name, en: p.name },
    level: 'bachelor',
    isced_f: FIELD_BY_NAME[p.name] ?? inferIsced(p.name),
    languages: u.languages,
    duration_years: null,
    tuition: [],
    deadlines: [],
    applicationFee: null,
    applicationUrl: null,
    code: null,
    sourceUrl: p.url,
    faculty: p.faculty,
  })),
}));

const out = {
  source: 'Official websites of the universities (checked 2026-10-22): METU, Boğaziçi, Bilkent, Sabancı',
  sourceKey: KEY,
  institutions,
};
writeFileSync('data/generated/turkey.json', JSON.stringify(out, null, 1));
const total = institutions.reduce((n, i) => n + i.programs.length, 0);
const unknown = institutions.flatMap((i) => i.programs.filter((p) => !p.isced_f).map((p) => `${i.slug}: ${p.names.en}`));
console.log(`${institutions.length} universities, ${total} programmes; without a field code: ${unknown.length}`);
unknown.forEach((u) => console.log('  -', u));
