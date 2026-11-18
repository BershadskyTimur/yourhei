import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (zh).
export const zhMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: '澳大利亚留学费用：国际学生学费',
    description: '国际学生在澳大利亚读一年要花多少钱：本科、硕士、职业教育和英语课程的学费，以及主要大学的学费，数据来自官方 CRICOS 登记册。',
    blocks: [
      { t: 'p', text: '在澳大利亚的大学读一年本科，国际学生大约需要 **43,000 澳元**。这是 2026 年 63 所大学 4,562 个课程的典型价格（中位数）。学院的职业培训价格约为其三分之一，每年约 13,500 澳元。下面按层次和主要大学列出价格，并说明办签证需要证明多少资金。' },
      { t: 'h2', id: 'levels', text: '按层次划分的价格' },
      {
        t: 'ul',
        items: [
          '**大学本科：**每年约 43,000 澳元。80% 的课程价格在 30,800 至 58,300 澳元之间（4,562 个课程）。',
          '**大学硕士：**每年约 35,300 澳元。80% 的课程价格在 22,100 至 54,900 澳元之间（35 所大学的 705 个课程；在登记册中，大型大学列出的硕士课程少于本科课程）。',
          '**学院和学校的职业教育（VET）：**每年约 13,500 澳元，80% 在 8,000 至 25,000 澳元之间（3,768 个课程）。',
          '**英语语言课程：**每年约 17,100 澳元，80% 在 11,900 至 25,600 澳元之间（948 个课程）。',
          '**面向国际学生的中小学：**每年约 31,000 澳元（838 个课程）。',
        ],
      },
      { t: 'h2', id: 'universities', text: '主要大学的价格（本科）' },
      { t: 'p', text: '该大学本科课程一年的典型价格，从低到高：' },
      {
        t: 'ul',
        items: [
          '[迪肯大学](/institutions/au/deakin-university)：约 44,400 澳元',
          '[昆士兰大学](/institutions/au/university-of-queensland)：约 47,200 澳元',
          '[麦考瑞大学](/institutions/au/macquarie-university)：约 48,200 澳元',
          '[皇家墨尔本理工大学（RMIT）](/institutions/au/rmit-university)：约 49,000 澳元',
          '[墨尔本大学](/institutions/au/university-of-melbourne)：约 49,100 澳元',
          '[悉尼科技大学](/institutions/au/university-of-technology-sydney)：约 51,000 澳元',
          '[西澳大学](/institutions/au/university-of-western-australia)：约 51,100 澳元',
          '[新南威尔士大学](/institutions/au/university-of-new-south-wales)：约 56,000 澳元',
          '[澳大利亚国立大学](/institutions/au/australian-national-university)：约 56,100 澳元',
          '[莫纳什大学](/institutions/au/monash-university)：约 59,300 澳元',
          '[悉尼大学](/institutions/au/university-of-sydney)：约 63,600 澳元',
        ],
      },
      { t: 'p', text: '同一所大学不同课程的价格差别很大。具体课程的价格见大学页面上该课程的卡片。' },
      { t: 'cta', href: '/institutions/au', text: '澳大利亚所有院校' },
      { t: 'cta', href: '/study/au', text: '在澳大利亚学习：专业方向' },
      { t: 'h2', id: 'how', text: '我们如何计算' },
      {
        t: 'ul',
        items: [
          '**数据来源**是 CRICOS，即澳大利亚政府的官方登记册：其中列出了所有可以持学生签证来读的课程，以及面向国际学生的学费。我们的数据库中有 1,540 家院校和约 19,000 个标有 2026 年学费的课程。',
          '**每年价格。**登记册给出的是整个课程的学费；我们将其除以课程年数。',
          '**中位数**是中间的价格：一半课程更便宜，一半更贵。',
          '**仅学费。**住宿、餐饮、海外学生健康保险（OSHC）和签证不包括在内。',
        ],
      },
      { t: 'h2', id: 'visa-money', text: '生活需要多少钱' },
      { t: 'p', text: '申请学生签证（subclass 500）时，必须证明有生活费：根据澳大利亚内政部 2026 年的数据，单身学生**每年 29,710 澳元**。这笔钱是在学费和路费之外的。申请前请在内政部网站上核实所需文件和金额。' },
      { t: 'note', text: '其他国家的金额：[办学生签证需要证明多少资金](/blog/proof-of-funds-student-visa)。' },
      { t: 'h2', id: 'cheaper', text: '如果太贵' },
      { t: 'p', text: '与其他国家比较：[出国留学要花多少钱](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country)，[学费免费或几乎免费的国家](/blog/free-tuition-germany-czechia-finland)。覆盖全部费用的奖学金：[面向国际学生的全额奖学金](/blog/fully-funded-scholarships-for-international-students)。' },
      { t: 'h2', id: 'sources', text: '来源' },
      { t: 'p', text: '学费：[CRICOS](https://cricos.education.gov.au/)，澳大利亚政府教育部，data.gov.au 开放数据，2026 年 10 月下载。生活费：[Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500)，澳大利亚内政部，2026 年 10 月 8 日核实。申请前请在课程页面核对价格。' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: '荷兰留学费用：国际学生学费',
    description: '在荷兰读一年要花多少钱：欧盟公民的法定学费、其他学生在各大学的学费，以及居留许可的费用，依据官方数据。',
    blocks: [
      { t: 'p', text: '对于欧盟以外的学生，在荷兰读一年硕士约需 **22,900 欧元**，读一年本科约需 **16,900 欧元**。这是 2026/27 和 2027/28 学年 501 个课程的典型价格（中位数）。欧盟、欧洲经济区、瑞士和苏里南公民支付法定学费：2026/27 学年为 **2,694 欧元**，大多数 2027/28 学年的课程标为 **2,771 欧元**。' },
      { t: 'h2', id: 'who-pays', text: '谁付多少' },
      {
        t: 'ul',
        items: [
          '**法定学费（wettelijk collegegeld）**适用于欧洲经济区、瑞士和苏里南公民，前提是他们还没有从荷兰公立院校获得相同的学位。所有公立院校的法定学费都相同。',
          '**院校学费（instellingscollegegeld）**适用于其他所有人，包括来自独联体国家、亚洲和非洲的学生。每所院校自行设定，因此在院校和课程之间各不相同。',
          '根据 Study in NL 的信息，部分院校还向欧洲经济区以外的学生收取申请费：75 至 100 欧元。',
        ],
      },
      { t: 'h2', id: 'levels', text: '欧盟以外学生的价格' },
      {
        t: 'ul',
        items: [
          '**硕士：**每年约 22,900 欧元。80% 的课程价格在 19,600 至 26,000 欧元之间（385 个课程）。',
          '**本科：**每年约 16,900 欧元。80% 的课程价格在 11,800 至 24,500 欧元之间（116 个课程）。',
          '荷兰的硕士通常为一年或两年；研究型大学的本科为三年，应用科学大学的本科为四年。',
        ],
      },
      { t: 'h2', id: 'universities', text: '主要大学的价格' },
      { t: 'p', text: '欧盟以外学生一年的典型价格：' },
      {
        t: 'ul',
        items: [
          '[拉德堡德大学](/institutions/nl/radboud-university)：本科约 15,800 欧元，硕士约 19,600 欧元',
          '[莱顿大学](/institutions/nl/leiden-university)：本科约 14,700 欧元，硕士约 22,900 欧元',
          '[特文特大学](/institutions/nl/university-of-twente)：本科约 16,900 欧元，硕士约 22,300 欧元',
          '[格罗宁根大学](/institutions/nl/university-of-groningen)：硕士约 22,800 欧元',
          '[阿姆斯特丹大学](/institutions/nl/university-of-amsterdam)：本科约 17,600 欧元，硕士约 25,900 欧元',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: '荷兰所有院校' },
      { t: 'cta', href: '/study/nl', text: '在荷兰学习：专业方向' },
      { t: 'h2', id: 'how', text: '我们如何计算' },
      {
        t: 'ul',
        items: [
          '**数据来源**是 Study in NL（Nuffic），荷兰留学的官方门户网站。我们的数据库中有 39 所院校和 1,481 个课程，其中 501 个标有欧盟以外学生的价格。',
          '**中位数**是中间的价格：一半课程更便宜，一半更贵。',
          '**仅学费。**住宿、餐饮、保险和居留许可不包括在内。',
        ],
      },
      { t: 'h2', id: 'permit', text: '居留许可和生活费' },
      {
        t: 'ul',
        items: [
          '**IND 申请费**：学习居留许可为 254 欧元（2026 年金额；IND 每年 1 月 1 日调整）。通常由院校代学生提交申请。',
          '**生活费：**IND 要求证明每月有 1,130.77 欧元（2026 年标准），一年学习约 13,600 欧元。',
          '**打工：**持学习居留许可每周最多可工作 16 小时，或在 6 月、7 月和 8 月全职工作；雇主通常需要工作许可。',
        ],
      },
      { t: 'note', text: '申请荷兰院校要通过 Studielink，很多课程截止日期较早：[截止日期以及 Studielink 如何运作](/blog/netherlands-application-deadlines-studielink)。面向欧洲经济区以外学生的奖学金：[NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply)。' },
      { t: 'h2', id: 'cheaper', text: '如果太贵' },
      { t: 'p', text: '与其他国家比较：[出国留学要花多少钱](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country)，[德国、捷克、芬兰：学费免费或几乎免费的国家](/blog/free-tuition-germany-czechia-finland)，[瑞典的学费](/blog/sweden-tuition-fees-international-students)。' },
      { t: 'h2', id: 'sources', text: '来源' },
      { t: 'p', text: '课程学费：Study in NL（Nuffic），2026/27 和 2027/28 学年。法定学费及适用人群：[Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees)。居留许可费用：[IND, Fees](https://ind.nl/en/fees-costs-of-an-application)。生活费：[IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements)。2026 年 11 月 18 日核实。申请前请在课程页面核对价格。' },
    ],
  },
};
