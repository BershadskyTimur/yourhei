import type { Translations } from '@/lib/blog/types';

// Machine translation of the article on tuition by country (zh).
export const zhMore4: Translations = {
  'how-much-does-it-cost-to-study-abroad-tuition-by-country': {
    title: '出国留学要花多少钱：5 个国家的学费',
    description: '国际学生在美国、澳大利亚、荷兰、芬兰和瑞典要付多少学费：根据官方数据整理的本科和硕士典型价格。',
    blocks: [
      { t: 'p', text: '申请者最常问的问题是“要花多少钱？”。答案取决于国家、学校和项目，但大致的数量级是清楚的。下面是五个国家面向国际学生的典型**学费**，根据 YourHEI 数据库中公布的价格计算（2026 年 10 月数据）。生活费不包括在内：见文章末尾。' },
      { t: 'h2', id: 'how', text: '我们如何计算' },
      {
        t: 'ul',
        items: [
          '**中位数**是位于中间的价格：一半项目更便宜，一半更贵。它比平均数更公平，因为少数非常昂贵的项目不会把它拉高。',
          '**区间**表示 80% 的价格所在的范围：去掉最便宜的 10% 和最贵的 10%。',
          '**每年价格。**如果来源给出的是整个课程的价格，我们按学制年数相除。',
          '**只计算价格已知**且适用于国际学生的项目。其他项目我们没有价格，也不会编造。',
        ],
      },
      { t: 'h2', id: 'usa', text: '美国' },
      {
        t: 'ul',
        items: [
          '**典型院校：**每年约 17,500 美元（3,083 所公布价格的院校的中位数，包括社区学院）。',
          '**区间：**每年 6,600 至 47,500 美元。',
          '**如何理解。**对于州立大学，数据库中是外州学生的价格，国际学生通常也付这个价格。私立大学对所有人收取同样的价格。这里只是学费，不含住宿、书本和保险。',
          '本科项目更多集中在学费较高的院校：如果按项目而不是按院校计算，中位数更高，约 31,000 美元。',
        ],
      },
      { t: 'p', text: '美国的院校和项目：[在美国留学](/study/us)。' },
      { t: 'h2', id: 'australia', text: '澳大利亚' },
      {
        t: 'ul',
        items: [
          '**本科：**每年约 40,400 澳元（区间 24,200–57,100），3,300 个项目。',
          '**硕士：**每年约 24,000 澳元（区间 12,000–38,800），1,570 个项目。',
          '来源是官方的 CRICOS 登记册，其中给出课程总费用；我们按学制相除。',
        ],
      },
      { t: 'p', text: '澳大利亚的项目：[在澳大利亚留学](/study/au)。' },
      { t: 'h2', id: 'netherlands', text: '荷兰' },
      {
        t: 'ul',
        items: [
          '**本科：**每年约 16,900 欧元（区间 11,800–24,500），109 个项目。',
          '**硕士：**每年约 22,900 欧元（区间 19,600–26,000），385 个项目。',
          '大约三分之一的项目（1,474 个中的 494 个）给出了欧洲经济区以外学生的价格：其余项目的来源中没有这类学生的价格。遇到这种情况，请咨询学校。',
        ],
      },
      { t: 'p', text: '荷兰的项目：[在荷兰留学](/study/nl)；如何以及何时申请：[荷兰：Studielink 与截止日期](/blog/netherlands-application-deadlines-studielink)；奖学金：[NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply)。' },
      { t: 'h2', id: 'finland', text: '芬兰' },
      {
        t: 'ul',
        items: [
          '**本科：**每年约 10,000 欧元（区间 9,500–12,000），262 个项目。',
          '**硕士：**每年约 12,000 欧元（区间 10,000–18,000），589 个项目。',
          '用芬兰语或瑞典语学习以及博士阶段免费（[了解更多](/blog/free-tuition-germany-czechia-finland)）。',
        ],
      },
      { t: 'p', text: '芬兰的项目：[在芬兰留学](/study/fi)。' },
      { t: 'h2', id: 'sweden', text: '瑞典' },
      {
        t: 'ul',
        items: [
          '**本科：**每年约 150,000 瑞典克朗（区间 97,000–290,000），101 个项目。',
          '**硕士：**每年约 147,000 瑞典克朗（区间 97,000–192,500），894 个项目。',
          '来源是瑞典官方申请门户 universityadmissions.se，其中给出项目总费用；我们按学制相除。来自欧盟、欧洲经济区和瑞士的学生不交学费：对他们来说学习是免费的。',
        ],
      },
      { t: 'h2', id: 'germany', text: '那德国和捷克呢？' },
      { t: 'p', text: '在德国公立大学，大多数情况下学习是免费的；在捷克，用捷克语授课的项目免费。这些规定及其例外单独说明：[在德国、捷克和芬兰留学免费吗？](/blog/free-tuition-germany-czechia-finland)。' },
      { t: 'h2', id: 'living', text: '学费并不是全部费用' },
      {
        t: 'ul',
        items: [
          '办理学生签证时，你必须证明自己能负担生活费：14 个国家的金额见[学生签证需要证明多少资金](/blog/proof-of-funds-student-visa)。',
          '实际花费通常高于签证要求的最低金额，尤其是在大城市。',
          '可以用奖学金降低学费：[面向国际学生的全额奖学金](/blog/fully-funded-scholarships-for-international-students)和[国家奖学金数据库](/scholarships)。',
        ],
      },
      { t: 'note', text: '价格每年都会变化，各大学也有自己的条件和优惠。申请前，请在项目的官方页面上核实价格：YourHEI 上每个院校页面都有链接。' },
      { t: 'p', text: '在[目录](/catalog)中，你可以用自己的货币查看价格，并按国家、层次和预算筛选项目。' },
      {
        t: 'p',
        text: '数据来源：[US College Scorecard](https://collegescorecard.ed.gov/data/)；[CRICOS，澳大利亚国际学生课程登记册](https://cricos.education.gov.au/)；[Study in NL](https://www.studyinnl.org/)；[Studyinfo，芬兰](https://opintopolku.fi/konfo/en/)；[universityadmissions.se，瑞典](https://www.universityadmissions.se/)。',
      },
      { t: 'cta', href: '/catalog', text: '按预算查找项目' },
      { t: 'cta', href: '/scholarships', text: '奖学金' },
    ],
  },
};
