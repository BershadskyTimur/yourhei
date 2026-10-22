// Builds data/generated/region.json: programmes of four universities of Central Asia and the Caucasus, copied (names only)
// from the official pages of the universities, checked on 2026-10-22:
//   Nazarbayev University (KZ)  https://nu.edu.kz/academics/programs  (every programme is marked "Language: English")
//   American University of Armenia (AM)  https://admissions.aua.am/ugrad/undergraduate-academic-programs/ and .../graduate/graduate-academic-programs/
//     (the language of instruction at AUA is English, with a few exceptions, says its admissions FAQ)
//   American University of Central Asia (KG)  https://auca.kg/en/acflp/  (the page does not give the language per programme: left empty)
//   Westminster International University in Tashkent (UZ)  https://www.wiut.uz/undergraduate ("all academic programmes are delivered entirely in English")
// Nothing else is filled in (no fees, dates or durations): the pages used do not state them.
// Load with: node scripts/load-programs.mjs data/generated/region.json   (needs the service key temporarily)
// Run: node scripts/build-region.mjs
import { writeFileSync } from 'node:fs';
import { inferIsced } from './lib/isced-infer.mjs';

const KEY = 'official_university_sites_region';

// Fields (ISCED-F 2013, 3 digits) that the keyword list does not recognise: our classification of the programme name.
const FIELD_BY_NAME = {
  'Bachelor in Nursing': '091', 'Master of Science in Nursing': '091', 'Bachelor of Science in Biological Sciences': '051', 'Master of Science in Biomedicine': '051',
  'Master of Public Health': '091', 'Master of Science in Life Sciences': '051', 'Ph.D. in Global Health': '091', 'Ph.D. in Biomedical Sciences': '051', 'Ph.D. in Life Sciences': '051',
  'Executive Master of Business Administration': '041', 'Master of Business Administration': '041', 'Doctor of Business Administration': '041', 'PhD in Business Administration': '041',
  'Master of Science in Finance': '041', 'Bachelor of Arts in Economics': '031', 'Master of Arts in Economics': '031',
  'Master of Arts in Global Affairs and Eurasian Studies (Joint Degree with SOAS)': '031', 'Master of Arts in Eurasian Studies': '031', 'PhD in Eurasian Studies': '031',
  'Bachelor of Arts in Political Science and International Relations': '031', 'Master of Arts in Political Science and International Relations': '031',
  'Master of Arts in Multilingual Education': '011', 'Master of Science in Educational Leadership': '011', 'Doctor of Philosophy in Education': '011',
  'Master in Public Administration': '031', 'Master in Public Policy': '031', 'Doctor of Public Management': '031', 'Ph.D. in Public Policy': '031',
  'Master of Applied Artificial Intelligence and Data Science': '061', 'Master of Science in Data Science': '061', 'Master of Science in Robotics': '061', 'Bachelor of Science in Robotics Engineering': '061',
  'Ph.D. in Robotics Engineering': '061', 'Bachelor of Science in Geology': '053', 'Master of Science in Geosciences': '053', 'Ph.D. in Geosciences': '053',
  'Bachelor of Science in Mining and Minerals Engineering': '071', 'Master of Science in Mining Engineering': '071', 'PhD in Mining Engineering': '071',
  'Bachelor of Science in Petroleum Engineering': '071', 'Master of Science in Petroleum Engineering': '071', 'PhD in Petroleum Engineering': '071',
  'Master of Science in Biomedical Engineering': '071', 'Master of Engineering Management': '041', 'PhD in Science, Engineering and Technology': '071',
  'BA in English and Communications': '023', 'BA in Politics and Governance': '031', 'BS in Engineering Sciences': '071', 'BS in Environmental and Sustainability Sciences': '052',
  'BS in Nursing': '091', 'BS in Data Science': '061', 'BA in Business': '041', 'BS in Economics': '031',
  'Master of Science in Management and Analytics (MSMA)': '041', 'Master of Arts in Teaching English as a Foreign Language (MATEFL)': '011',
  'Master of Arts in Human Rights and Social Justice (MAHRSJ)': '031', 'Master of Arts in International Relations and Diplomacy (MAIRD)': '031', 'Master of Public Affairs (MPA)': '031',
  'Master of Arts in Multiplatform Journalism (MAMJ)': '032', 'Master of Arts in Education (MAED)': '011',
  'Master of Engineering in Industrial Engineering and Systems Management (MEIESM)': '071', 'Master of Science in Computer and Information Science (MSCIS)': '061',
  'Anthropology, Technology and International Development': '031', 'Applied Geology': '053', 'Applied Mathematics and Informatics': '054', 'European Studies': '031',
  'International and Business Law': '038', 'International and Comparative Politics': '031', 'Journalism and Mass Communication': '032', 'Liberal Arts and Sciences': '00',
  'Television, Cinema and Media Arts': '021', 'Master of Arts in Anthropology, Urbanism and International Development': '031', 'Master of Arts in Applied Psychology': '031',
  'Master of Arts in Central Asian Studies': '031', 'Master of Arts in Journalism': '032', 'Master of Arts in Sociology': '031', 'Master of Arts in Teaching': '011',
  'Master of Laws (LL.M.)': '038', 'Masters of Business Administration': '041', 'MSc in Economics Program': '031',
  'BA (Hons) in International Relations and Law': '031', 'BSc (Hons) in Economics and its Pathways': '031', 'BSc (Hons) in Computer Science': '061', 'BA (Hons) in Commercial Law': '038',
  'BSc (Hons) in Finance': '041', 'BA (Hons) in Business Management and its Pathways': '041', 'BSc (Hons) in Business Information Systems': '061',
};
const fieldOf = (name) => FIELD_BY_NAME[name] ?? inferIsced(name);

const nu = (names, level, base) => names.map(([name, school, url]) => ({ name, level, faculty: school, url }));
const NU = [
  // undergraduate (the 6-year medical programme and the Doctor of Medicine are not included: their level is not clear)
  ...nu([
    ['Bachelor in Nursing', 'School of Medicine', 'https://nusom.nu.edu.kz/bn'], ['Bachelor of Science in Biological Sciences', 'School of Medicine', 'https://nusom.nu.edu.kz/bbs'],
    ['Bachelor of Business Administration', 'Graduate School of Business', 'https://gsb.nu.edu.kz/bba'], ['Bachelor of Arts in Economics', 'Graduate School of Business', 'https://gsb.nu.edu.kz/econ'],
    ['Bachelor of Business Administration in Eurasian Business (Joint Degree with HKUST)', 'Graduate School of Business', 'https://gsb.nu.edu.kz/bbaeabu'],
    ['Bachelor of Science in Geology', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_geology'], ['Bachelor of Science in Mining and Minerals Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_me'],
    ['Bachelor of Science in Petroleum Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_pe'], ['Bachelor of Engineering in Chemical and Materials Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_cme'],
    ['Bachelor of Engineering in Electrical and Computer Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_ece'], ['Bachelor of Engineering in Civil and Environmental Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_cee'],
    ['Bachelor of Engineering in Mechanical and Aerospace Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/bachelor_of_mae'],
    ['Bachelor of Science in Mathematics', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/bsc-math'], ['Bachelor of Science in Computer Science', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/bsc-cs'],
    ['Bachelor of Science in Robotics Engineering', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/bsc-rob'],
    ['Bachelor of Science in Physics', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/bscphysics'], ['Bachelor of Science in Chemistry', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/bscchem'],
    ['Bachelor of Arts in Sociology', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/basociology'], ['Bachelor of Arts in Political Science and International Relations', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/bapsir'],
  ], 'bachelor'),
  ...nu([
    ['Master of Science in Biomedicine', 'School of Medicine', 'https://nusom.nu.edu.kz/msbm'], ['Master of Science in Nursing', 'School of Medicine', 'https://nusom.nu.edu.kz/msn'],
    ['Master of Public Health', 'School of Medicine', 'https://nusom.nu.edu.kz/mph'], ['Master of Science in Life Sciences', 'School of Medicine', 'https://nusom.nu.edu.kz/mls'],
    ['Executive Master of Business Administration', 'Graduate School of Business', 'https://gsb.nu.edu.kz/executivemba'], ['Master of Science in Finance', 'Graduate School of Business', 'https://gsb.nu.edu.kz/msc_in_finance'],
    ['Master of Business Administration', 'Graduate School of Business', 'https://gsb.nu.edu.kz/mba'], ['Master of Arts in Economics', 'Graduate School of Business', 'https://gsb.nu.edu.kz/maecon'],
    ['Master of Arts in Global Affairs and Eurasian Studies (Joint Degree with SOAS)', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/nusoas'],
    ['Master of Science in Chemistry', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/mscchem'], ['Master of Science in Physics', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/mscphysics'],
    ['Master of Arts in Political Science and International Relations', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/mapsirgr'], ['Master of Arts in Eurasian Studies', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/maeurasian'],
    ['Master of Arts in Multilingual Education', 'Graduate School of Education', 'https://gse.nu.edu.kz/maprogram'], ['Master of Science in Educational Leadership', 'Graduate School of Education', 'https://gse.nu.edu.kz/mscprograms'],
    ['Master in Public Administration', 'Graduate School of Public Policy', 'https://gspp.nu.edu.kz/gsppmpa'], ['Master in Public Policy', 'Graduate School of Public Policy', 'https://gspp.nu.edu.kz/gsppmpp'],
    ['Master of Applied Artificial Intelligence and Data Science', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/msc-ai'], ['Master of Science in Data Science', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/msc-ds'],
    ['Master of Science in Computer Science', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/msc-cs'], ['Master of Science in Applied Mathematics', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/msc-math'],
    ['Master of Science in Robotics', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/msc-rob'],
    ['Master of Science in Geosciences', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_geosciences'], ['Master of Science in Petroleum Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_pe'],
    ['Master of Science in Mining Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_me'], ['Master of Science in Biomedical Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_be'],
    ['Master of Science in Civil and Environmental Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_cee'], ['Master of Science in Chemical and Materials Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_cme'],
    ['Master of Science in Electrical and Computer Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_ece'], ['MSc in Mechanical and Aerospace Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/msc_in_mae'],
    ['Master of Engineering Management', 'School of Engineering', 'https://soe.nu.edu.kz/master_of_em'],
  ], 'master'),
  ...nu([
    ['Ph.D. in Global Health', 'School of Medicine', 'https://nusom.nu.edu.kz/phd-in-global-health'], ['Ph.D. in Biomedical Sciences', 'School of Medicine', 'https://nusom.nu.edu.kz/phd-in-biomedical-sciences'],
    ['Ph.D. in Life Sciences', 'School of Medicine', 'https://nusom.nu.edu.kz/phd-in-life-sciences'],
    ['Doctor of Business Administration', 'Graduate School of Business', 'https://gsb.nu.edu.kz/dba'], ['PhD in Business Administration', 'Graduate School of Business', 'https://gsb.nu.edu.kz/phd_in_ba'],
    ['Ph.D. in Geosciences', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_geosciences'], ['PhD in Mining Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_me'],
    ['PhD in Petroleum Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_pe'], ['PhD in Science, Engineering and Technology', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_set'],
    ['Ph.D. in Chemical Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_che'], ['Ph.D. in Mechanical Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_mae'],
    ['Ph.D. in Electrical Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_ee'], ['Ph.D. in Civil Engineering', 'School of Engineering', 'https://soe.nu.edu.kz/phd_in_ce'],
    ['Ph.D. in Chemistry', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/phd_chem'], ['Ph.D. in Physics', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/phys_graduate_programs'],
    ['PhD in Eurasian Studies', 'School of Sciences and Humanities', 'https://ssh.nu.edu.kz/c_eas'],
    ['Ph.D. in Mathematics', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/phd-math'], ['Ph.D. in Computer Science', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/phd-cs'],
    ['Ph.D. in Robotics Engineering', 'School of Computing and Artificial Intelligence', 'https://scai.nu.edu.kz/phd-rob'],
    ['Doctor of Philosophy in Education', 'Graduate School of Education', 'https://gse.nu.edu.kz/phdprogram'],
    ['Doctor of Public Management', 'Graduate School of Public Policy', 'https://gspp.nu.edu.kz/gsppdpm'], ['Ph.D. in Public Policy', 'Graduate School of Public Policy', 'https://gspp.nu.edu.kz/gsppphd'],
  ], 'phd'),
];

const AUA = [
  ...[['BA in Business', 'https://cbe.aua.am/ba-business/'], ['BS in Economics', 'https://cbe.aua.am/bs-in-economics/'], ['BA in English and Communications', 'https://baec.aua.am/'],
    ['BA in Politics and Governance', 'https://bapg.aua.am/'], ['BS in Computer Science', 'https://cse.aua.am/cs/'], ['BS in Data Science', 'http://cse.aua.am/ds/'],
    ['BS in Engineering Sciences', 'http://cse.aua.am/es/'], ['BS in Environmental and Sustainability Sciences', 'https://cse.aua.am/ess/'], ['BS in Nursing', 'https://chs.aua.am/bachelor-of-science-in-nursing/'],
  ].map(([name, url]) => ({ name, level: 'bachelor', faculty: null, url })),
  ...[['Master of Business Administration (MBA)', 'http://cbe.aua.am/mba/'], ['Master of Science in Management and Analytics (MSMA)', 'https://cbe.aua.am/msma/'], ['Master of Science in Economics (MSE)', 'http://cbe.aua.am/ms-economics/'],
    ['Master of Arts in Teaching English as a Foreign Language (MATEFL)', 'http://tefl.aua.am/matefl/'], ['Master of Laws (LL.M.)', 'http://law.aua.am/llm/'],
    ['Master of Arts in Human Rights and Social Justice (MAHRSJ)', 'https://hrsj.aua.am/'], ['Master of Arts in International Relations and Diplomacy (MAIRD)', 'https://psia.aua.am/maird/'],
    ['Master of Public Affairs (MPA)', 'https://psia.aua.am/mpa/'], ['Master of Arts in Multiplatform Journalism (MAMJ)', 'https://chss.aua.am/mamj/'], ['Master of Arts in Education (MAED)', 'https://chss.aua.am/maed/'],
    ['Master of Public Health (MPH)', 'http://chs.aua.am/mph/'], ['Master of Engineering in Industrial Engineering and Systems Management (MEIESM)', 'http://cse.aua.am/graduate-programs/iesm/'],
    ['Master of Science in Computer and Information Science (MSCIS)', 'http://cse.aua.am/graduate-programs/cis/'],
  ].map(([name, url]) => ({ name, level: 'master', faculty: null, url })),
];
// the field table above uses the names without the abbreviation in brackets for some programmes
for (const p of AUA) if (!FIELD_BY_NAME[p.name]) FIELD_BY_NAME[p.name] = FIELD_BY_NAME[p.name.replace(/ \([A-Z.]+\)$/, '')] ?? null;
FIELD_BY_NAME['Master of Business Administration (MBA)'] = '041';
FIELD_BY_NAME['Master of Science in Economics (MSE)'] = '031';
FIELD_BY_NAME['Master of Laws (LL.M.)'] = '038';
FIELD_BY_NAME['Master of Public Health (MPH)'] = '091';

const AUCA = [
  ...[['Anthropology, Technology and International Development', 'https://dss.auca.kg/bachelor-degree-in-anthropology/'], ['Applied Geology', 'https://auca.kg/en/applied_geology/'], ['Applied Mathematics and Informatics', 'https://auca.kg/en/app_math/'],
    ['Business Administration', 'https://seba.auca.kg/undergraduate/'], ['Economics', 'http://economics.auca.kg/'], ['European Studies', 'https://auca.kg/en/european_studies_/'],
    ['International and Business Law', 'https://auca.kg/en/international_and_business_law_department/'], ['International and Comparative Politics', 'https://auca.kg/en/icp/'],
    ['Journalism and Mass Communication', 'https://dss.auca.kg/bachelor-in-journalism-and-mass-communications/'], ['Liberal Arts and Sciences', 'https://las.auca.kg/'], ['Psychology', 'https://dss.auca.kg/bachelor-in-psychology/'],
    ['Sociology', 'https://dss.auca.kg/bachelor-in-sociology/'], ['Software Engineering', 'https://auca.kg/en/software_engineering_/'], ['Television, Cinema and Media Arts', 'https://dss.auca.kg/bachelor-in-tv-cinema-and-media-arts/'],
  ].map(([name, url]) => ({ name, level: 'bachelor', faculty: null, url })),
  ...[['Master of Arts in Anthropology, Urbanism and International Development', 'https://dss.auca.kg/master-in-anthropology/'], ['Master of Arts in Applied Psychology', 'https://dss.auca.kg/master-in-applied-psychology/'],
    ['Master of Arts in Central Asian Studies', 'https://auca.kg/en/macas/'], ['Master of Arts in Journalism', 'https://dss.auca.kg/master-in-journalism-and-mass-communications/'],
    ['Master of Arts in Sociology', 'https://dss.auca.kg/master-in-sociology/'], ['Master of Arts in Teaching', 'https://ioe.auca.kg/'], ['Master of Laws (LL.M.)', 'https://auca.kg/en/llm/'],
    ['Masters of Business Administration', 'http://business.auca.kg/?page_id=379'], ['MSc in Economics Program', 'http://economics.auca.kg/'],
  ].map(([name, url]) => ({ name, level: 'master', faculty: null, url })),
];

const WIUT = [['BA (Hons) in International Relations and Law', 'international-relations-and-law'], ['BSc (Hons) in Economics and its Pathways', 'economics'], ['BSc (Hons) in Computer Science', 'bsc-hons-in-computer-science'],
  ['BA (Hons) in Commercial Law', 'commercial-law'], ['BSc (Hons) in Finance', 'finance'], ['BA (Hons) in Business Management and its Pathways', 'business-management'],
  ['BSc (Hons) in Business Information Systems', 'business-information-systems'],
].map(([name, path]) => ({ name, level: 'bachelor', faculty: null, url: `https://www.wiut.uz/${path}` }));

const universities = [
  { slug: 'nazarbayev-university', country: 'KZ', names: { original: 'Nazarbayev University', en: 'Nazarbayev University' }, city: 'Astana', lat: 51.09, lng: 71.39944, website: 'https://nu.edu.kz/', languages: ['en'], programs: NU },
  { slug: 'american-university-of-armenia', country: 'AM', names: { original: 'American University of Armenia', en: 'American University of Armenia' }, city: 'Yerevan', lat: 40.1932, lng: 44.5045, website: 'https://aua.am/', languages: ['en'], programs: AUA },
  { slug: 'american-university-of-central-asia', country: 'KG', names: { original: 'American University of Central Asia', en: 'American University of Central Asia' }, city: 'Bishkek', lat: 42.81119, lng: 74.62721, website: 'https://auca.kg/', languages: [], programs: AUCA },
  { slug: 'westminster-international-university-in-tashkent', country: 'UZ', names: { original: 'Westminster International University in Tashkent', en: 'Westminster International University in Tashkent' }, city: 'Tashkent', lat: 41.30694, lng: 69.28333, website: 'https://www.wiut.uz/', languages: ['en'], programs: WIUT },
];

const institutions = universities.map((u) => ({
  externalIds: { [KEY]: u.slug },
  slug: u.slug,
  existing: true,
  country: u.country,
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
    level: p.level,
    isced_f: fieldOf(p.name),
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

writeFileSync('data/generated/region.json', JSON.stringify({
  source: 'Official websites of the universities (checked 2026-10-22): Nazarbayev University, American University of Armenia, American University of Central Asia, Westminster International University in Tashkent',
  sourceKey: KEY,
  institutions,
}, null, 1));
const total = institutions.reduce((n, i) => n + i.programs.length, 0);
console.log(`${institutions.length} universities, ${total} programmes`);
for (const i of institutions) {
  const missing = i.programs.filter((p) => !p.isced_f).map((p) => p.names.en);
  console.log(`  ${i.slug}: ${i.programs.length} programmes, without a field: ${missing.length}`, missing.slice(0, 8));
}
