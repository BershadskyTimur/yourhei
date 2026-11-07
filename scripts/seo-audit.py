# SEO check of the live site as Googlebot sees it: robots.txt, the sitemap, and a sample of pages of every kind
# (status, title, description, canonical, noindex, H1, hreflang, speed). Prints a flag for everything that looks wrong.
#   python scripts/seo-audit.py
# Nothing is written; it only reads public pages. See .claude/skills/seo-yourhei/SKILL.md for how to read the result.
import re, sys, time, random, urllib.request, collections
# The Windows console is not UTF-8 by default: without this, the first Russian or Chinese title stopped the script.
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
BASE = 'https://www.yourhei.com'

def get(url):
    t = time.time()
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Encoding': 'identity'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode('utf8', 'replace')
            return r.status, r.geturl(), body, time.time() - t, dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, url, '', time.time() - t, {}
    except Exception as e:
        return 0, url, str(e), time.time() - t, {}

st, _, robots, _, _ = get(BASE + '/robots.txt')
print('robots', st); print(robots[:1500])
st, final, sm, _, _ = get(BASE + '/sitemap.xml'); print('sitemap.xml', st, final)
urls = []
for m in re.findall(r'<loc>([^<]+)</loc>', robots + sm):
    pass
sitemaps = re.findall(r'Sitemap:\s*(\S+)', robots)
for s in sitemaps:
    st, _, body, dt, _ = get(s)
    locs = re.findall(r'<loc>([^<]+)</loc>', body)
    print('sitemap', s, st, len(locs), f'{dt:.1f}s')
    urls += locs
print('total urls', len(urls))
kinds = collections.Counter(re.sub(r'^https://www\.yourhei\.com/(ru|en)', '', u).split('/')[1] if '/' in re.sub(r'^https://www\.yourhei\.com/(ru|en)', '', u) else 'home' for u in urls)
print(kinds.most_common())
random.seed(1)
by = collections.defaultdict(list)
for u in urls:
    p = re.sub(r'^https://www\.yourhei\.com/(ru|en)', '', u)
    by[p.split('/')[1] if p.count('/') else 'home'].append(u)
sample = []
for k, v in by.items():
    sample += random.sample(v, min(len(v), 6))
titles = collections.Counter(); bad = []
for u in sample:
    st, final, html, dt, h = get(u)
    title = (re.search(r'<title>([^<]*)</title>', html) or [None, ''])[1]
    desc = (re.search(r'<meta name="description" content="([^"]*)"', html) or [None, ''])[1]
    canon = (re.search(r'<link rel="canonical" href="([^"]*)"', html) or [None, ''])[1]
    robots_meta = (re.search(r'<meta name="robots" content="([^"]*)"', html) or [None, ''])[1]
    h1 = len(re.findall(r'<h1[\s>]', html))
    hre = len(re.findall(r'hreflang=', html, re.I))  # Next.js writes "hrefLang"
    words = len(re.sub(r'<[^>]+>', ' ', re.sub(r'<script[\s\S]*?</script>', ' ', html)).split())
    titles[title] += 1
    flag = []
    if st != 200: flag.append(f'STATUS {st}')
    if final != u: flag.append('REDIRECT ' + final)
    if canon and canon != u: flag.append('CANON ' + canon)
    if 'noindex' in robots_meta: flag.append('NOINDEX')
    elif hre == 0: flag.append('NO HREFLANG')
    if not desc: flag.append('NO DESC')
    if h1 != 1: flag.append(f'H1={h1}')
    if dt > 3: flag.append(f'SLOW {dt:.1f}s')
    print(f'{st} {dt:4.1f}s w={words:5d} hl={hre} {u[len(BASE):len(BASE) + 65]:65s} | {title[:60]} | {" ".join(flag)}')
print('duplicate titles', [t for t, n in titles.items() if n > 1])
