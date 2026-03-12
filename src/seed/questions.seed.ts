import { ArtPeriod, QuestionType } from '../questions/question.entity';
import { CreateQuestionDto } from '../questions/questions.service';

type AuthoritativeSource = {
  institution: string;
  sourceSite: string;
  sourceUrl: string;
};

export const AUTHORITATIVE_SOURCES: ReadonlyArray<AuthoritativeSource> = [
  {
    institution: '耶鲁大学',
    sourceSite: '耶鲁大学 Yale University',
    sourceUrl: 'https://arthistory.yale.edu/',
  },
  {
    institution: '哈佛大学',
    sourceSite: '哈佛大学 Harvard University',
    sourceUrl: 'https://arthistory.fas.harvard.edu/',
  },
  {
    institution: '考陶尔德艺术研究院',
    sourceSite: '考陶尔德艺术研究院 Courtauld Institute of Art',
    sourceUrl: 'https://courtauld.ac.uk/',
  },
  {
    institution: '斯莱德美术学院',
    sourceSite: '斯莱德美术学院 Slade School of Fine Art, UCL',
    sourceUrl: 'https://www.ucl.ac.uk/slade/',
  },
] as const;

export function attachAuthoritativeSourceMetadata(
  question: CreateQuestionDto,
): CreateQuestionDto {
  const matchedSource = AUTHORITATIVE_SOURCES.find(({ institution }) =>
    question.source?.includes(institution),
  );

  if (!matchedSource) {
    return question;
  }

  return {
    ...question,
    sourceSite: question.sourceSite ?? matchedSource.sourceSite,
    sourceUrl: question.sourceUrl ?? matchedSource.sourceUrl,
  };
}

/**
 * 艺术史题库 — 改编自耶鲁大学、哈佛大学、考陶尔德艺术研究院、
 * 斯莱德美术学院等权威机构的艺术史课程考题，已翻译为中文并附答案解析。
 */
const BASE_SEED_QUESTIONS: CreateQuestionDto[] = [
  // ─────────────── 古代艺术 ───────────────
  {
    content: '古希腊雕塑《米洛的维纳斯》（Aphrodite of Milos）创作于哪个时期？',
    options: [
      '古风时期（约公元前700—前480年）',
      '古典时期（约公元前480—前323年）',
      '希腊化时期（约公元前323—前31年）',
      '罗马时期',
    ],
    answer: '2',
    explanation:
      '《米洛的维纳斯》约作于公元前130—前100年，属于希腊化时期晚期作品，以优美的扭曲姿态和细腻的大理石雕刻著称。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '哈佛大学艺术史基础课程参考题',
    difficulty: 2,
    tags: '古希腊,雕塑,希腊化时期',
  },
  {
    content:
      '古埃及艺术中，法老头像侧面像与身体正面像同时出现的绘画惯例被称为什么？',
    options: [
      '透视法',
      '正面律（Frontalism / Composite View）',
      '明暗对比法',
      '轮廓线法',
    ],
    answer: '1',
    explanation:
      '古埃及绘画遵循"正面律"，将人物最具代表性的角度组合在一张图像中：头部侧面、眼睛正面、肩部正面、腰以下侧面，以保证信息完整传达。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '耶鲁大学艺术史导论参考题',
    difficulty: 1,
    tags: '古埃及,绘画惯例,正面律',
  },
  {
    content: '帕特农神庙（Parthenon）建于哪个城市，供奉哪位神祇？',
    options: [
      '科林斯，阿波罗',
      '雅典，雅典娜',
      '斯巴达，阿瑞斯',
      '奥林匹亚，宙斯',
    ],
    answer: '1',
    explanation:
      '帕特农神庙建于雅典卫城，供奉城市守护神雅典娜（Athena），由建筑师伊克提诺斯（Iktinos）和卡利克拉特斯（Kallikrates）于公元前447—前432年主持建造。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '考陶尔德艺术研究院入学考试参考题',
    difficulty: 1,
    tags: '古希腊,建筑,帕特农神庙',
  },
  {
    content: '以下哪项是古罗马建筑对后世影响最深远的结构发明？',
    options: [
      '柱廊',
      '拱券与穹顶（Arch and Dome）',
      '三角形山墙',
      '多立克柱式',
    ],
    answer: '1',
    explanation:
      '罗马建筑师将拱券和穹顶技术推向极致，万神庙（Pantheon）的43米混凝土穹顶至今仍是工程奇迹，直接影响了文艺复兴、巴洛克及现代建筑。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '耶鲁大学艺术史课程题库',
    difficulty: 2,
    tags: '古罗马,建筑,拱券,穹顶',
  },
  {
    content: '下列关于古希腊三大柱式的描述，正确的是？',
    options: [
      '多立克柱式（Doric）最为华丽，有涡卷装饰',
      '爱奥尼柱式（Ionic）有涡卷柱头，科林斯柱式（Corinthian）有莨苕叶柱头',
      '科林斯柱式最为简朴，常用于神庙内部',
      '多立克柱式有柱础，爱奥尼柱式没有柱础',
    ],
    answer: '1',
    explanation:
      '爱奥尼柱式以双涡卷柱头为特征，科林斯柱式以茂盛的莨苕（acanthus）叶柱头为特征，两者均比简朴的多立克柱式更为精细。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '斯莱德美术学院艺术史笔试题',
    difficulty: 2,
    tags: '古希腊,建筑,柱式',
  },

  // ─────────────── 中世纪艺术 ───────────────
  {
    content: '哥特式大教堂中"飞扶壁"（Flying Buttress）的主要功能是什么？',
    options: [
      '增加室内光线',
      '将拱顶的侧推力传导至外墙，使墙体可以更轻薄并开大窗户',
      '装饰教堂外观',
      '支撑地下室的重量',
    ],
    answer: '1',
    explanation:
      '飞扶壁是哥特式建筑的关键结构，将拱顶的横向推力绕过侧廊传递到外部支撑柱，使中殿墙壁可以大量开窗，充满彩色玻璃，象征神圣光芒。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MEDIEVAL,
    source: '哈佛大学中世纪艺术史课程题',
    difficulty: 2,
    tags: '中世纪,哥特式,建筑结构,飞扶壁',
  },
  {
    content:
      '拜占庭艺术中，镶嵌画（Mosaic）大量使用金色背景，其象征意义是什么？',
    options: [
      '代表王室的财富',
      '象征天国神圣光辉，超越世俗时间与空间',
      '模仿古罗马壁画风格',
      '仅为装饰效果',
    ],
    answer: '1',
    explanation:
      '拜占庭镶嵌画以金箔底衬配合玻璃彩片，金色背景象征永恒、神圣的天国领域，圣像人物正面直视观者，呈现超越性存在，而非世俗空间。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MEDIEVAL,
    source: '考陶尔德艺术研究院中世纪艺术模拟题',
    difficulty: 2,
    tags: '拜占庭,镶嵌画,象征主义',
  },
  {
    content: '《凯尔斯书》（Book of Kells）是哪种艺术形式的代表作？',
    options: [
      '哥特式壁画',
      '爱尔兰-撒克逊装饰手稿（Insular Manuscript）',
      '意大利祭坛画',
      '弗莱芒油画',
    ],
    answer: '1',
    explanation:
      '《凯尔斯书》约创作于公元800年前后，是爱尔兰-撒克逊（Hiberno-Saxon/Insular）风格的福音书手稿，以极为精细的几何与动物纹样装饰而闻名。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MEDIEVAL,
    source: '耶鲁大学中世纪艺术课程参考题',
    difficulty: 2,
    tags: '中世纪,手稿绘画,爱尔兰艺术',
  },
  {
    content: '罗马式建筑（Romanesque）与哥特式建筑最主要的区别是什么？',
    options: [
      '罗马式使用尖形拱券，哥特式使用半圆形拱券',
      '罗马式使用厚重石墙与半圆拱，哥特式使用肋拱、飞扶壁与尖拱，墙体更轻薄',
      '罗马式教堂更高大，哥特式教堂更低矮',
      '罗马式使用彩色玻璃，哥特式不使用',
    ],
    answer: '1',
    explanation:
      '罗马式建筑依靠厚重石墙承重，开窗受限；哥特式通过尖拱、交叉肋骨拱顶（ribbed vault）和飞扶壁将重力定向传导，解放墙体，实现大面积彩色玻璃窗。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MEDIEVAL,
    source: '斯莱德美术学院入学笔试参考题',
    difficulty: 1,
    tags: '中世纪,建筑风格,罗马式,哥特式',
  },

  // ─────────────── 文艺复兴 ───────────────
  {
    content: '达·芬奇（Leonardo da Vinci）在《最后的晚餐》中运用了哪种透视法？',
    options: [
      '大气透视法',
      '单点线性透视法（一点透视）',
      '多点透视法',
      '平行透视法',
    ],
    answer: '1',
    explanation:
      '《最后的晚餐》以基督头部为消失点，采用单点线性透视（一点透视），使构图向画面中心汇聚，强化了耶稣作为视觉与精神核心的地位。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '哈佛大学文艺复兴艺术史课程题',
    difficulty: 1,
    tags: '文艺复兴,达芬奇,透视法',
  },
  {
    content:
      '米开朗基罗为西斯廷礼拜堂（Sistine Chapel）穹顶所作的著名壁画中，《创造亚当》中上帝与亚当之间未接触的手指象征什么？',
    options: [
      '亚当拒绝上帝',
      '神与人之间生命能量（神圣灵魂）的传递瞬间',
      '上帝的愤怒',
      '亚当即将离开伊甸园',
    ],
    answer: '1',
    explanation:
      '米开朗基罗通过两手指间的细微间隙表达神与人之间生命传递的瞬间张力，是西方艺术史上最具感染力的图像之一，体现了新柏拉图主义对灵魂与神圣的思考。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '考陶尔德艺术研究院文艺复兴专题模拟题',
    difficulty: 2,
    tags: '文艺复兴,米开朗基罗,西斯廷礼拜堂,图像学',
  },
  {
    content: '"sfumato"（晕涂法）是哪位艺术家的标志性绘画技法？',
    options: ['拉斐尔', '提香', '达·芬奇', '米开朗基罗'],
    answer: '2',
    explanation:
      'Sfumato（字面意为"烟雾状"）由达·芬奇发展完善，通过极薄的颜料层叠涂，使轮廓线柔和消融于阴影中，《蒙娜丽莎》的神秘微笑即得益于此技法。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '耶鲁大学意大利文艺复兴绘画课程题',
    difficulty: 1,
    tags: '文艺复兴,达芬奇,绘画技法,晕涂法',
  },
  {
    content:
      '北方文艺复兴画家扬·凡·艾克（Jan van Eyck）对绘画技术的最大贡献是什么？',
    options: [
      '发明了素描透视图',
      '推广和完善了油画技法，使颜色更鲜艳、层次更丰富',
      '首创了蛋彩画技法',
      '发明了铜版画技术',
    ],
    answer: '1',
    explanation:
      '凡·艾克将油画媒介（油性颜料）发展到成熟阶段，油性结合剂干燥缓慢，允许细腻混色和透明釉层叠加，使光感和细节达到前所未有的精度。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '哈佛大学北方文艺复兴专题课程题',
    difficulty: 2,
    tags: '北方文艺复兴,凡艾克,油画技法',
  },
  {
    content:
      '拉斐尔（Raphael）的《雅典学院》（School of Athens）中，画面中心的两位人物分别代表谁？',
    options: [
      '苏格拉底与亚里士多德',
      '柏拉图（指天）与亚里士多德（指地）',
      '达·芬奇与米开朗基罗',
      '赫拉克利特与毕达哥拉斯',
    ],
    answer: '1',
    explanation:
      '画面中央为柏拉图（以达·芬奇为原型）手指向上，象征理念世界；亚里士多德手掌向下，象征关注现实世界，两人代表着理想主义与经验主义的对立。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '考陶尔德艺术研究院图像学专题题',
    difficulty: 1,
    tags: '文艺复兴,拉斐尔,图像学,哲学',
  },
  {
    content: '威尼斯文艺复兴画家提香（Titian）在色彩运用上有何创新？',
    options: [
      '首创单色素描底稿',
      '通过直接在画布上反复叠涂色层（impasto）塑造丰富色彩与笔触质感',
      '发明了水彩技法',
      '以精准线描为主，不重视色彩',
    ],
    answer: '1',
    explanation:
      '提香以其大胆的笔触和色彩层叠著称，晚年作品笔触更为自由奔放（impasto），对鲁本斯、委拉斯凯兹、伦勃朗乃至印象派均产生了深远影响。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '耶鲁大学威尼斯绘画专题课程题',
    difficulty: 2,
    tags: '文艺复兴,提香,威尼斯,色彩主义',
  },

  // ─────────────── 巴洛克 / 洛可可 ───────────────
  {
    content:
      '卡拉瓦乔（Caravaggio）在绘画中发展的"明暗对照法"（Chiaroscuro/Tenebrism）是指什么？',
    options: [
      '用蓝色和橙色形成色彩对比',
      '用极强的光暗对比（深暗背景中突出亮部）制造戏剧张力',
      '用湿壁画技法绘制阴影',
      '专门绘制夜景的技法',
    ],
    answer: '1',
    explanation:
      '卡拉瓦乔以极端的明暗对比（Tenebrism）为特征，人物从黑暗背景中被强光照亮，制造强烈戏剧效果，深刻影响了后世巴洛克诸多画家。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.BAROQUE,
    source: '哈佛大学巴洛克艺术史课程题',
    difficulty: 1,
    tags: '巴洛克,卡拉瓦乔,明暗对照法',
  },
  {
    content: '鲁本斯（Peter Paul Rubens）所属的艺术中心是哪个城市？',
    options: ['阿姆斯特丹', '安特卫普', '罗马', '马德里'],
    answer: '1',
    explanation:
      '鲁本斯（1577—1640）是弗莱芒巴洛克最重要的代表画家，长期在比利时安特卫普创作，其画室规模庞大，产量惊人，融合了意大利文艺复兴与北方传统。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.BAROQUE,
    source: '考陶尔德艺术研究院巴洛克专题题',
    difficulty: 2,
    tags: '巴洛克,鲁本斯,弗莱芒绘画',
  },
  {
    content:
      '伦勃朗（Rembrandt）最著名的集体肖像画《夜巡》（The Night Watch）描绘的是什么场景？',
    options: [
      '皇室家族宴会',
      '阿姆斯特丹民兵连队出行',
      '宗教游行队伍',
      '市政厅官员集会',
    ],
    answer: '1',
    explanation:
      '《夜巡》（1642年）描绘阿姆斯特丹班宁·柯克（Frans Banning Cocq）上尉率领的民兵连队整装出发，是荷兰黄金时代集体肖像画的巅峰之作，创新性地呈现动态场景而非静态排列。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.BAROQUE,
    source: '哈佛大学荷兰黄金时代艺术课程题',
    difficulty: 1,
    tags: '巴洛克,伦勃朗,荷兰绘画',
  },
  {
    content: '洛可可艺术风格（Rococo）最早兴起于哪个国家，其主要特征是什么？',
    options: [
      '意大利，以宏大庄严的宗教题材为主',
      '法国，以轻盈优雅的S形曲线、柔和色彩和贵族享乐题材为主',
      '德国，以严肃的历史题材为主',
      '英国，以肖像画为主',
    ],
    answer: '1',
    explanation:
      '洛可可约兴起于18世纪初法国，是对路易十四巴洛克宏大风格的反动，以轻盈、精致、充满曲线的装饰风格和对爱情、欢宴、田园等主题的偏好为特征，代表画家有华托（Watteau）、弗拉戈纳尔（Fragonard）。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.BAROQUE,
    source: '耶鲁大学18世纪欧洲艺术课程题',
    difficulty: 1,
    tags: '洛可可,法国艺术,装饰风格',
  },
  {
    content:
      '委拉斯凯兹（Velázquez）的《宫娥》（Las Meninas）中，镜子里反射的是哪两位人物？',
    options: [
      '宫廷侍女与画家本人',
      '西班牙国王腓力四世与王后玛丽亚娜',
      '玛格丽塔公主与她的保姆',
      '公主与画家',
    ],
    answer: '1',
    explanation:
      '《宫娥》（1656年）镜中映出正在接受画像的西班牙国王腓力四世与王后玛丽亚娜，画家将观者（和皇室夫妇）置于画外，引发了关于视角与再现的哲学讨论。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.BAROQUE,
    source: '考陶尔德艺术研究院巴洛克绘画图像学题',
    difficulty: 2,
    tags: '巴洛克,委拉斯凯兹,图像学,西班牙绘画',
  },

  // ─────────────── 现代艺术 ───────────────
  {
    content: '印象派（Impressionism）的名称来自哪幅画作？',
    options: [
      '马奈的《草地上的午餐》',
      '莫奈的《印象·日出》（Impression, Sunrise）',
      '德加的《舞蹈课》',
      '雷诺阿的《煎饼磨坊的舞会》',
    ],
    answer: '1',
    explanation:
      '1874年第一届印象派展览上，批评家路易·勒鲁瓦嘲讽莫奈的《印象·日出》，"印象主义"由此得名，后来反成为这一流派的自豪称号。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学现代艺术史课程题',
    difficulty: 1,
    tags: '印象派,莫奈,现代艺术',
  },
  {
    content:
      '后印象派（Post-Impressionism）画家塞尚（Cézanne）对20世纪艺术最重要的影响是什么？',
    options: [
      '他创立了抽象表现主义',
      '他对物体几何结构的分析直接启发了立体主义（Cubism）的诞生',
      '他发明了点彩技法',
      '他是最早使用丙烯颜料的画家',
    ],
    answer: '1',
    explanation:
      '塞尚将自然归结为球体、锥体、圆柱体等基本几何形，打破传统透视，从多角度同时观察物体，直接启发了毕加索和布拉克创立立体主义，被誉为"现代艺术之父"。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学现代艺术史课程题',
    difficulty: 1,
    tags: '后印象派,塞尚,立体主义,现代艺术之父',
  },
  {
    content:
      '梵高（Vincent van Gogh）的作品《星夜》（The Starry Night）创作于什么地方？',
    options: [
      '巴黎',
      '阿尔勒',
      '圣雷米精神病疗养院（Saint-Paul-de-Mausole）',
      '奥弗小镇',
    ],
    answer: '2',
    explanation:
      '《星夜》（1889年6月）创作于梵高在圣雷米精神病疗养院期间，他透过房间的铁窗凝望星空，以旋涡状笔触表达内心的情感张力。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院后印象派专题题',
    difficulty: 2,
    tags: '后印象派,梵高,星夜',
  },
  {
    content: '立体主义（Cubism）的两位主要创始人是谁？',
    options: [
      '马蒂斯和莫迪里阿尼',
      '毕加索和布拉克（Georges Braque）',
      '达利和米罗',
      '康定斯基和克利',
    ],
    answer: '1',
    explanation:
      '毕加索（Pablo Picasso）和乔治·布拉克（Georges Braque）于1907—1914年共同发展了立体主义，毕加索的《亚维农少女》（1907年）是其滥觞。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学立体主义专题课程题',
    difficulty: 1,
    tags: '现代艺术,立体主义,毕加索,布拉克',
  },
  {
    content: '超现实主义（Surrealism）宣言由谁撰写，于哪一年发表？',
    options: [
      '安德烈·布勒东（André Breton），1924年',
      '萨尔瓦多·达利，1929年',
      '马克斯·恩斯特，1921年',
      '路易·阿拉贡，1930年',
    ],
    answer: '0',
    explanation:
      '安德烈·布勒东于1924年发表《超现实主义宣言》，宣称超现实主义是"纯粹的心理自动主义"，旨在摆脱理性控制，释放潜意识，成为该运动的理论奠基。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学超现实主义艺术课程题',
    difficulty: 2,
    tags: '超现实主义,布勒东,现代艺术运动',
  },
  {
    content: '野兽派（Fauvism）最重要的代表画家是谁？',
    options: [
      '毕加索',
      '亨利·马蒂斯（Henri Matisse）',
      '乔治·修拉',
      '爱德华·蒙克',
    ],
    answer: '1',
    explanation:
      '马蒂斯是野兽派领袖，1905年在秋季沙龙以强烈非自然色彩震惊评论界，批评家路易·沃克塞尔称其为"野兽"，Fauvism（野兽派）由此得名。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院早期现代主义课程题',
    difficulty: 1,
    tags: '野兽派,马蒂斯,现代主义',
  },
  {
    content: '抽象表现主义（Abstract Expressionism）兴起于哪个国家和时代？',
    options: [
      '法国，20世纪20年代',
      '美国纽约，20世纪40—50年代',
      '德国，20世纪30年代',
      '英国，20世纪60年代',
    ],
    answer: '1',
    explanation:
      '抽象表现主义是二战后首个获得国际影响力的美国艺术运动，中心在纽约，代表人物有杰克逊·波洛克（滴画技法）、马克·罗斯科（色域绘画）、威廉·德库宁等。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学战后美国艺术课程题',
    difficulty: 1,
    tags: '抽象表现主义,美国艺术,纽约派',
  },
  {
    content: '包豪斯（Bauhaus）学校的创始人是谁？成立于哪一年？',
    options: [
      '保罗·克利，1910年',
      '瓦尔特·格罗皮乌斯（Walter Gropius），1919年',
      '马塞尔·杜尚，1917年',
      '蒙德里安，1920年',
    ],
    answer: '1',
    explanation:
      '格罗皮乌斯1919年在魏玛创立包豪斯，主张艺术与工艺的结合，影响了现代设计、建筑和视觉艺术的整个20世纪发展，直至今日。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学设计史课程题',
    difficulty: 1,
    tags: '包豪斯,现代设计,格罗皮乌斯',
  },
  {
    content:
      '达达主义（Dada）艺术家马塞尔·杜尚（Marcel Duchamp）将小便池展示为艺术品，命名为《泉》（Fountain，1917年），这挑战了什么传统观念？',
    options: [
      '绘画颜色的选择',
      '"什么是艺术"的定义——即艺术的本质在于观念而非技艺（Ready-made 现成品概念）',
      '传统素描技法',
      '宗教图像传统',
    ],
    answer: '1',
    explanation:
      '杜尚的"现成品"（Readymade）概念认为，任何物体一旦被艺术家选择并置于艺术语境中，即可成为艺术品，彻底颠覆了以技艺和美感为核心的传统艺术定义，对概念艺术影响深远。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院达达与超现实主义课程题',
    difficulty: 2,
    tags: '达达主义,杜尚,现成品,概念艺术',
  },
  {
    content: '德国表现主义（German Expressionism）两大重要群体是什么？',
    options: [
      '野兽派与立体派',
      '"桥社"（Die Brücke）与"蓝骑士"（Der Blaue Reiter）',
      '包豪斯与乌尔姆设计学院',
      '柏林分离派与慕尼黑分离派',
    ],
    answer: '1',
    explanation:
      '"桥社"（1905年，德累斯顿）以基尔希纳为核心，以粗犷笔触表达城市异化；"蓝骑士"（1911年，慕尼黑）以康定斯基、弗兰茨·马尔克为核心，探索精神性与抽象。两者共同构成德国表现主义核心。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学表现主义专题课程题',
    difficulty: 2,
    tags: '德国表现主义,桥社,蓝骑士',
  },
  {
    content:
      '蒙德里安（Piet Mondrian）创立的"新造型主义"（De Stijl / Neoplasticism）的核心视觉原则是什么？',
    options: [
      '用有机曲线表达自然',
      '只使用水平线、垂直线和三原色（红、黄、蓝）及黑白灰',
      '以螺旋形构图表达宇宙秩序',
      '用随机滴溅的颜料创作',
    ],
    answer: '1',
    explanation:
      '蒙德里安认为艺术应追求绝对纯粹，将形式简化为垂直与水平线的网格，颜色只用三原色（红、黄、蓝）和非色彩（黑、白、灰），以表达宇宙的普遍和谐秩序。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学抽象艺术史课程题',
    difficulty: 1,
    tags: '新造型主义,蒙德里安,De Stijl,抽象艺术',
  },

  // ─────────────── 当代艺术 ───────────────
  {
    content: '波普艺术（Pop Art）兴起于哪两个国家，代表艺术家有哪些？',
    options: [
      '法国和德国，代表有波伊斯和培根',
      '英国和美国，代表有安迪·沃霍尔、罗伊·利希滕斯坦、理查德·汉密顿',
      '意大利和西班牙，代表有达利和德基里科',
      '日本和中国，代表有草间弥生和蔡国强',
    ],
    answer: '1',
    explanation:
      '波普艺术20世纪50年代兴起于英国（理查德·汉密顿等），60年代在美国达到高峰，安迪·沃霍尔的丝网印刷、利希滕斯坦的漫画风格成为最具标志性的波普符号，聚焦于大众消费文化。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '耶鲁大学当代艺术史课程题',
    difficulty: 1,
    tags: '波普艺术,安迪沃霍尔,当代艺术',
  },
  {
    content: '安迪·沃霍尔（Andy Warhol）的工作室绰号是什么？',
    options: ['蓝色工厂', '工厂（The Factory）', '艺术实验室', '纽约工坊'],
    answer: '1',
    explanation:
      '沃霍尔在纽约的工作室被称为"工厂"（The Factory），是1960年代前卫艺术、时尚和波西米亚文化的聚集地，以工业化复制方式大批量生产艺术品。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '考陶尔德艺术研究院当代艺术课程题',
    difficulty: 1,
    tags: '波普艺术,沃霍尔,当代艺术',
  },
  {
    content:
      '极简主义（Minimalism）艺术家唐纳德·贾德（Donald Judd）的雕塑"特定物体"（Specific Objects）挑战了什么传统艺术概念？',
    options: [
      '挑战了透视法在绘画中的运用',
      '打破了绘画与雕塑的界限，强调作品本身的物质性而非参照任何外部事物',
      '挑战了色彩理论',
      '质疑了版画的复数性',
    ],
    answer: '1',
    explanation:
      '贾德的"特定物体"（1965年文章）认为最有趣的新工作既非绘画也非雕塑，而是三维物体本身，强调形式的简洁性、工业材料和非参照性，反对作品传达情感或叙事的传统。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '哈佛大学极简主义艺术专题题',
    difficulty: 3,
    tags: '极简主义,贾德,当代艺术,雕塑',
  },
  {
    content: '概念艺术（Conceptual Art）的核心主张是什么？',
    options: [
      '技艺是艺术中最重要的部分',
      '艺术作品的观念/想法本身就是艺术，物质形式退居其次',
      '艺术必须反映社会现实',
      '艺术只有在博物馆中才有意义',
    ],
    answer: '1',
    explanation:
      '索尔·勒维特（Sol LeWitt）1967年的《概念艺术笔记》中写道："在概念艺术中，观念或概念是作品最重要的方面"，物质表达只是概念的一种实现，这与杜尚的遗产直接相连。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '耶鲁大学概念艺术课程题',
    difficulty: 2,
    tags: '概念艺术,当代艺术,勒维特',
  },

  // ─────────────── 非西方艺术 ───────────────
  {
    content:
      '日本浮世绘（Ukiyo-e）版画对西方艺术产生了深远影响，这种影响被称为什么？',
    options: [
      '东方主义（Orientalism）',
      '日本主义（Japonisme）',
      '中国主义（Chinoiserie）',
      '东亚风尚（Asian Trend）',
    ],
    answer: '1',
    explanation:
      '19世纪中后期大量浮世绘版画涌入欧洲，其平面化构图、大块色彩区域、非对称构图对马奈、莫奈、梵高、图卢兹-劳特累克等人产生重大影响，这一文化现象被称为"日本主义"（Japonisme）。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '耶鲁大学全球艺术史课程题',
    difficulty: 2,
    tags: '日本艺术,浮世绘,日本主义,跨文化影响',
  },
  {
    content: '《富岳三十六景》系列版画的作者是谁？',
    options: ['歌川广重', '葛饰北斋', '喜多川歌麿', '东洲斋写乐'],
    answer: '1',
    explanation:
      '葛饰北斋（Katsushika Hokusai，1760—1849）创作了《富岳三十六景》，其中《神奈川冲浪里》是世界上最广为人知的版画之一，以动态波浪和远景富士山的构图著称。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '哈佛大学东亚艺术史课程题',
    difficulty: 1,
    tags: '日本艺术,浮世绘,北斋,版画',
  },
  {
    content:
      '非洲伊费（Ife）青铜头像（约公元12—14世纪）在艺术史上的重要意义是什么？',
    options: [
      '是已知最早的铸铜技术',
      '以极具写实性的自然主义风格展现了撒哈拉以南非洲的高度文明',
      '是最早的宗教图腾',
      '影响了古埃及艺术风格',
    ],
    answer: '1',
    explanation:
      '尼日利亚伊费的铸铜头像以惊人的写实主义表现人物面部，打破了西方曾长期认为非洲艺术不具写实能力的偏见，是非洲艺术成就的重要证明。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '耶鲁大学全球艺术史课程题',
    difficulty: 2,
    tags: '非洲艺术,伊费,青铜头像,写实主义',
  },
  {
    content: '印度泰姬陵（Taj Mahal）由哪位莫卧儿帝王建造，为谁而建？',
    options: [
      '阿克巴大帝，为其母亲',
      '沙贾汗（Shah Jahan），为其爱妻慕塔芝·玛哈尔（Mumtaz Mahal）',
      '奥朗则布，为其父亲',
      '贾汉吉尔，为其自己',
    ],
    answer: '1',
    explanation:
      '泰姬陵（1632—1653年）由沙贾汗皇帝为悼念爱妻慕塔芝·玛哈尔而建于阿格拉，是莫卧儿建筑的巅峰之作，融合了波斯、伊斯兰与印度建筑传统。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '哈佛大学伊斯兰艺术与建筑课程题',
    difficulty: 1,
    tags: '印度艺术,泰姬陵,莫卧儿建筑',
  },
  {
    content:
      '中国山水画（Landscape Painting）的核心美学观念"气韵生动"出自哪位理论家？',
    options: ['苏轼', '谢赫（南齐，《古画品录》）', '米芾', '董其昌'],
    answer: '1',
    explanation:
      '南朝齐的谢赫在《古画品录》中提出著名的"六法"，首法即"气韵生动"，强调作品要传达生命活力与精神气质，是中国古典绘画批评的最高标准，对后世影响极深。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '哈佛大学中国艺术史课程题',
    difficulty: 2,
    tags: '中国艺术,绘画理论,谢赫,气韵生动',
  },
  {
    content:
      '阿兹特克文明中，太阳石（Aztec Sun Stone，又称"阿兹特克历法石"）的主要功能是什么？',
    options: [
      '用作祭祀台',
      '记录宇宙创生与毁灭的神话宇宙观，并可能是一种宗教礼仪石',
      '作为天文望远镜的底座',
      '记录战争胜利',
    ],
    answer: '1',
    explanation:
      '太阳石（约创于1427—1479年）并非严格意义上的日历，而是表达阿兹特克宇宙观：中央为太阳神托纳提乌，周围刻有四个曾被毁灭的宇宙纪元，表达世界循环创毁的神话思想。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.NON_WESTERN,
    source: '耶鲁大学美洲前哥伦布艺术课程题',
    difficulty: 3,
    tags: '阿兹特克,前哥伦布,美洲艺术,宇宙观',
  },

  // ─────────────── 综合/多选题 ───────────────
  {
    content: '以下哪些艺术家属于后印象派（Post-Impressionism）？（多选）',
    options: [
      '保罗·塞尚',
      '克劳德·莫奈',
      '文森特·梵高',
      '保罗·高更',
      '皮埃尔-奥古斯特·雷诺阿',
    ],
    answer: '0,2,3',
    explanation:
      '后印象派主要代表：塞尚、梵高、高更，他们各自发展了超越印象派光色捕捉的个人风格。莫奈和雷诺阿属于印象派核心成员。',
    type: QuestionType.MULTIPLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院现代艺术史综合题',
    difficulty: 2,
    tags: '后印象派,综合题,艺术流派',
  },
  {
    content: '以下哪些属于文艺复兴时期意大利的代表性建筑？（多选）',
    options: [
      '佛罗伦萨主教座堂（圆顶，布鲁内莱斯基设计）',
      '巴黎圣母院',
      '坦比哀托礼拜堂（伯拉孟特设计）',
      '科隆大教堂',
      '圣彼得大教堂（包括米开朗基罗设计的穹顶）',
    ],
    answer: '0,2,4',
    explanation:
      '布鲁内莱斯基的佛罗伦萨穹顶、伯拉孟特的坦比哀托和米开朗基罗参与设计的圣彼得大教堂穹顶均为意大利文艺复兴建筑的代表。巴黎圣母院和科隆大教堂是哥特式建筑代表。',
    type: QuestionType.MULTIPLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '耶鲁大学文艺复兴建筑史课程题',
    difficulty: 2,
    tags: '文艺复兴,建筑,综合题',
  },
  {
    content:
      '判断：印象派画家主要在室外（en plein air）作画，以捕捉瞬间光线变化。',
    options: ['正确', '错误'],
    answer: '0',
    explanation:
      '印象派画家确实大量推广了户外写生（en plein air）技法，借助19世纪中期可携带的管装颜料的发明，得以在自然光下直接捕捉光线与大气效果，这是区别于学院派室内创作的重要特征。',
    type: QuestionType.TRUE_FALSE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学印象派艺术课程题',
    difficulty: 1,
    tags: '印象派,创作方法,户外写生',
  },
  {
    content: '判断：包豪斯学校（Bauhaus）在纳粹上台后被迫于1933年关闭。',
    options: ['正确', '错误'],
    answer: '0',
    explanation:
      '包豪斯1919年成立于魏玛，后迁德绍、柏林，1933年纳粹上台后被迫关闭，大量师生流亡美国，将现代设计理念带入新大陆，对美国现代设计教育产生深远影响。',
    type: QuestionType.TRUE_FALSE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学包豪斯与现代设计课程题',
    difficulty: 1,
    tags: '包豪斯,德国艺术,历史',
  },

  // ─────────────── 更多现代与当代艺术 ───────────────
  {
    content: '弗里达·卡洛（Frida Kahlo）的绘画风格通常被归入哪一流派？',
    options: [
      '立体主义',
      '超现实主义（本人更倾向于"我画的是我的现实"）',
      '抽象表现主义',
      '极简主义',
    ],
    answer: '1',
    explanation:
      '弗里达·卡洛的作品常被归入超现实主义，但她本人曾说"我从不画梦境，我画自己的现实"，其作品融合了墨西哥民间艺术、自传式痛苦与超现实意象，独树一帜。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院拉丁美洲艺术专题题',
    difficulty: 1,
    tags: '超现实主义,弗里达卡洛,墨西哥艺术',
  },
  {
    content:
      '爱德华·蒙克（Edvard Munch）的《呐喊》（The Scream，1893年）中，画面背景的红色天空灵感来源于什么真实事件？',
    options: [
      '工厂烟囱排放的污染',
      '1883年喀拉喀托火山爆发后大气中的火山灰造成的异常落日',
      '奥斯陆海湾的极光',
      '战争中的炮火',
    ],
    answer: '1',
    explanation:
      '据研究，1883年喀拉喀托火山大爆发后的数年间，火山灰漂浮于大气层中，造成欧洲多地出现血红色异常落日，蒙克日记中记载了他目睹血红天空的恐惧体验，此即《呐喊》背景的灵感。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学北欧表现主义艺术课程题',
    difficulty: 3,
    tags: '表现主义,蒙克,呐喊,象征主义',
  },
  {
    content:
      '谁提出了"少即是多"（Less is more）的建筑设计哲学，并设计了著名的巴塞罗那德国馆？',
    options: [
      '勒·柯布西耶',
      '路德维希·密斯·凡·德·罗（Ludwig Mies van der Rohe）',
      '弗兰克·劳埃德·赖特',
      '阿尔瓦·阿尔托',
    ],
    answer: '1',
    explanation:
      '密斯·凡·德·罗以"少即是多"的极简设计哲学著称，1929年巴塞罗那国际博览会德国馆以开放流动空间、大理石与玻璃材质体现了现代主义建筑的精髓。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学现代建筑史课程题',
    difficulty: 1,
    tags: '现代建筑,密斯,包豪斯,少即是多',
  },
  {
    content:
      '杰克逊·波洛克（Jackson Pollock）的"滴画"（Drip Painting）技法中，他如何在画布上作画？',
    options: [
      '用超细画笔精确描绘',
      '将画布铺在地上，在画布周围走动，将颜料滴溅或泼洒在上面',
      '用手指直接涂抹',
      '用刮刀将颜料刮平',
    ],
    answer: '1',
    explanation:
      '波洛克将大型画布铺于地面，以棍棒、毛刷等工具将颜料直接甩溅于画布，通过身体运动的轨迹形成图像，摒弃传统的笔触控制，强调行为本身的直接性，是"行动绘画"（Action Painting）的核心代表。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学抽象表现主义课程题',
    difficulty: 1,
    tags: '抽象表现主义,波洛克,滴画,行动绘画',
  },
  {
    content: '以下关于印象派绘画特征的描述，哪项是错误的？',
    options: [
      '使用短促、可见的笔触',
      '注重捕捉光线在不同时刻的变化',
      '强调轮廓线的清晰与精确',
      '倾向于户外写生',
    ],
    answer: '2',
    explanation:
      '印象派恰恰是反对学院派对清晰轮廓线的强调，而是以松散的笔触和色彩对比暗示形体，强调光与色的瞬间感受，而非精确描绘轮廓。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院印象派专题题',
    difficulty: 1,
    tags: '印象派,绘画特征,综合辨析',
  },
  {
    content:
      '新古典主义（Neoclassicism）与浪漫主义（Romanticism）在艺术上的根本分歧是什么？',
    options: [
      '对色彩的使用态度不同',
      '新古典主义强调理性、秩序与古典规范；浪漫主义强调情感、个人、异国情调和自然崇高',
      '对雕塑与绘画的偏好不同',
      '新古典主义只画肖像，浪漫主义只画风景',
    ],
    answer: '1',
    explanation:
      '新古典主义（代表：大卫、安格尔）推崇希腊罗马典范，强调理性、线条和道德叙事；浪漫主义（代表：德拉克洛瓦、热里科）则崇尚情感激烈、色彩强烈和崇高体验，是对理性主义的反动。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '耶鲁大学19世纪艺术史课程题',
    difficulty: 2,
    tags: '新古典主义,浪漫主义,艺术比较',
  },
  {
    content:
      "印象派画家爱德华·马奈（Édouard Manet）的《草地上的午餐》（Le Déjeuner sur l'herbe，1863年）引发巨大争议的原因是什么？",
    options: [
      '画面颜色太暗',
      '将衣冠楚楚的现代男士与裸体女性并置在当代场景中，挑战了传统裸体画的神话主题惯例',
      '尺寸太小',
      '技法过于粗糙',
    ],
    answer: '1',
    explanation:
      '马奈将裸体女性（无神话或历史借口）与穿现代服装的男士同置于当代巴黎郊外野餐场景，直接挑战了传统裸体画必须以古典神话为题的惯例，被评论界斥为"不道德"，成为现代艺术史的重要转折点。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学印象派与现代主义课程题',
    difficulty: 2,
    tags: '马奈,印象派前驱,现代主义,图像学',
  },
  {
    content:
      '点彩派（Pointillism/Divisionism）的代表艺术家是谁，该技法的科学依据是什么？',
    options: [
      '修拉（Georges Seurat）和西涅克（Paul Signac）；基于同时代对比的色彩科学理论',
      '莫奈和毕沙罗；基于印象派速写理论',
      '塞尚和高更；基于东方色彩理论',
      '梵高和马蒂斯；基于情感表达理论',
    ],
    answer: '0',
    explanation:
      '修拉和西涅克基于科学家谢弗勒尔（Chevreul）的色彩对比理论，用细小的纯色色点并置，依靠观者眼中的视觉混合形成色彩，而非在调色板上预先混色，追求更明亮的视觉效果。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院后印象派课程题',
    difficulty: 2,
    tags: '点彩派,修拉,色彩科学,后印象派',
  },
  {
    content:
      '马克·罗斯科（Mark Rothko）的"色域绘画"（Color Field Painting）的核心意图是什么？',
    options: [
      '展示精湛的绘画技法',
      '通过大面积朦胧色块引发观者的沉浸式情感与精神体验',
      '记录特定时刻的光线变化',
      '描绘抽象的几何图案',
    ],
    answer: '1',
    explanation:
      '罗斯科希望观者近距离面对他的大型色块画，被色彩的光辉与模糊边界所包围，体验一种超越语言的情感或精神状态，他曾说他想表达的是"人类基本情感的悲剧性"。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '耶鲁大学战后抽象艺术课程题',
    difficulty: 2,
    tags: '抽象表现主义,罗斯科,色域绘画',
  },
  {
    content:
      '约瑟夫·波伊斯（Joseph Beuys）"社会雕塑"（Social Sculpture）的概念是指什么？',
    options: [
      '用社会废弃物制作雕塑',
      '每个人都是艺术家，整个社会可以被塑造成艺术作品，艺术与政治社会行动融为一体',
      '在公共场所展示传统雕塑',
      '用社会调查数据创作数据可视化艺术',
    ],
    answer: '1',
    explanation:
      '波伊斯的"社会雕塑"是一种扩展的艺术观，主张艺术不限于画布或雕像，而是延伸至人类所有创造性行动，每个人都可以通过思考、语言和行动塑造社会，是其激进民主政治观与艺术实践的统一。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '考陶尔德艺术研究院当代艺术理论课程题',
    difficulty: 3,
    tags: '当代艺术,波伊斯,社会雕塑,行为艺术',
  },
  {
    content: '弗朗西斯·培根（Francis Bacon）的绘画以什么著称？',
    options: [
      '清晰的线条与纯净的色彩',
      '变形扭曲的人体形象，强调存在的痛苦与孤独',
      '大面积纯色平涂',
      '照相写实主义式的精准描绘',
    ],
    answer: '1',
    explanation:
      '培根以强烈变形的人物形象著称，人体在孤立的空间中被扭曲、肉质化，传达存在主义的焦虑、孤独与痛苦，是20世纪后半叶英国最重要的具象绘画大师。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '哈佛大学英国当代艺术课程题',
    difficulty: 2,
    tags: '当代艺术,培根,英国绘画,存在主义',
  },

  // ─────────────── 艺术理论与批评 ───────────────
  {
    content:
      '瓦萨里（Giorgio Vasari）的《艺苑名人传》（Lives of the Artists，1550年）的历史意义是什么？',
    options: [
      '是第一部关于希腊艺术的著作',
      '建立了以艺术家个人传记为核心的西方艺术史写作传统，并确立了以文艺复兴为艺术高峰的线性历史叙事',
      '是第一部关于中国艺术的西方著作',
      '首次提出了形式主义批评方法',
    ],
    answer: '1',
    explanation:
      '瓦萨里的《艺苑名人传》是艺术史学科的奠基之作，首次系统记录从契马布耶到米开朗基罗的艺术家生平，建立了以"进步"和"复兴"为叙事框架的艺术史传统，影响延续至今。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '考陶尔德艺术研究院艺术史方法论课程题',
    difficulty: 2,
    tags: '艺术史,瓦萨里,艺术史学史',
  },
  {
    content:
      '艾尔文·帕诺夫斯基（Erwin Panofsky）提出的"图像学"（Iconology）方法包括哪三个解读层次？',
    options: [
      '材料分析、技法分析、市场分析',
      '前图像志描述（图像识别）、图像志分析（主题识别）、图像学诠释（文化象征意义）',
      '形式分析、内容分析、风格分析',
      '历史背景、社会语境、心理动机',
    ],
    answer: '1',
    explanation:
      '帕诺夫斯基的三层次：①前图像志——识别可见对象与行为；②图像志——识别故事、寓言、主题；③图像学——揭示作品深层的文化、哲学、宗教象征意义，是20世纪最重要的艺术史方法论之一。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学艺术史方法论课程题',
    difficulty: 3,
    tags: '艺术史方法论,图像学,帕诺夫斯基',
  },
  {
    content: '克莱门特·格林伯格（Clement Greenberg）的"形式主义"批评强调什么？',
    options: [
      '艺术的政治功能',
      '每种艺术媒介的"纯粹性"与自我批判——绘画应回归其本质属性（平面性），排除叙事与幻觉',
      '艺术作品的市场价值',
      '艺术与日常生活的关联',
    ],
    answer: '1',
    explanation:
      '格林伯格在1939年《前卫与庸俗》等文章中主张，现代主义绘画应通过自我批判回归媒介本质（绘画的平面性、色彩的纯粹性），以区别于通俗文化和文学叙事，深刻影响了抽象表现主义的批评话语。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.CONTEMPORARY,
    source: '耶鲁大学艺术批评理论课程题',
    difficulty: 3,
    tags: '艺术批评,形式主义,格林伯格,现代主义理论',
  },

  // ─────────────── 补充题目 ───────────────
  {
    content:
      '米开朗基罗的大卫像（David，1501—1504年）现收藏于哪座城市的哪家博物馆？',
    options: [
      '罗马，梵蒂冈博物馆',
      "佛罗伦萨，学院美术馆（Galleria dell'Accademia）",
      '巴黎，卢浮宫',
      '纽约，大都会艺术博物馆',
    ],
    answer: '1',
    explanation:
      "大卫像原置于佛罗伦萨市政厅广场，1873年为保护雕像迁入学院美术馆（Galleria dell'Accademia），广场现存放复制品。大卫像以精准解剖和英雄主义气概体现了文艺复兴人文精神。",
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '哈佛大学文艺复兴艺术课程题',
    difficulty: 1,
    tags: '文艺复兴,米开朗基罗,大卫像,雕塑',
  },
  {
    content:
      "\"艺术为艺术而艺术\"（L'art pour l'art / Art for Art's Sake）这一主张最早与哪个运动相关联？",
    options: [
      '印象主义',
      '唯美主义（Aestheticism）运动，19世纪英国',
      '达达主义',
      '社会现实主义',
    ],
    answer: '1',
    explanation:
      '"艺术为艺术"（Art for Art\'s Sake）的口号在19世纪英国唯美主义运动中得到最充分阐发，奥斯卡·王尔德等人主张艺术无需道德或功利目的，美本身就是艺术的终极价值。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院19世纪艺术理论课程题',
    difficulty: 2,
    tags: '唯美主义,艺术理论,19世纪',
  },
  {
    content:
      '古希腊雕塑"孔罗斯"（Kouros）与文艺复兴裸体雕塑在哲学内涵上有何根本区别？',
    options: [
      '孔罗斯是神圣或英雄人物的理想化形象，以某种形式承载宗教功能；文艺复兴裸体则更强调人文精神与个体的尊严和美',
      '两者完全相同，没有本质区别',
      '孔罗斯是女性裸体，文艺复兴是男性裸体',
      '孔罗斯是写实的，文艺复兴是理想化的',
    ],
    answer: '0',
    explanation:
      '孔罗斯（约公元前7—前5世纪）通常为祭神的奉献品或墓碑标记，承载宗教或礼仪功能；文艺复兴裸体（如米开朗基罗的大卫）则以古典典范为媒介，颂扬人的尊严、理性和能力，体现了人文主义精神。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '耶鲁大学艺术史导论比较题',
    difficulty: 3,
    tags: '古希腊,文艺复兴,裸体雕塑,比较研究',
  },
  {
    content:
      '卡斯帕·大卫·弗里德里希（Caspar David Friedrich）的《雾海上的漫游者》（Wanderer above the Sea of Fog，约1818年）体现了浪漫主义的哪个核心主题？',
    options: [
      '城市化与工业革命的喜悦',
      '崇高（Sublime）——个体面对宏大自然时既敬畏又渺小的情感体验',
      '对古典秩序的赞颂',
      '对战争的讴歌',
    ],
    answer: '1',
    explanation:
      '弗里德里希画中孤独的人物背对观者俯瞰云海，体现了浪漫主义核心主题"崇高"（Sublime）——Edmund Burke和康德所阐述的：面对无限壮阔自然时人类的渺小感与精神震撼，二者共同构成崇高体验。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '哈佛大学浪漫主义艺术史课程题',
    difficulty: 2,
    tags: '浪漫主义,弗里德里希,崇高,德国艺术',
  },
  {
    content:
      '奥古斯特·罗丹（Auguste Rodin）的《思想者》（The Thinker）最初是作为哪件大型作品的一部分而创作的？',
    options: [
      '独立创作，无大型项目关联',
      '《地狱之门》（The Gates of Hell）顶部中央人物',
      '巴黎市政厅装饰项目',
      '为卢浮宫宫门创作',
    ],
    answer: '1',
    explanation:
      '《思想者》最初设计为《地狱之门》顶部中央的"诗人"（但丁）形象，俯视地狱诸景沉思，后独立放大展出。《地狱之门》受但丁《神曲》启发，是罗丹最宏大的未竟之作。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.MODERN,
    source: '考陶尔德艺术研究院19世纪雕塑课程题',
    difficulty: 2,
    tags: '19世纪雕塑,罗丹,地狱之门',
  },
  {
    content: '古罗马帝国时期的"凯旋柱"（如图拉真柱）的主要功能是什么？',
    options: [
      '作为天文观测台',
      '以连续螺旋式浮雕记录皇帝的军事功绩，兼具纪念碑与宣传功能',
      '作为城市的水塔',
      '用于宗教祭祀仪式',
    ],
    answer: '1',
    explanation:
      '图拉真柱（公元113年落成）以190米长的螺旋形浮雕带连续记录图拉真皇帝征服达契亚的战役，是公共纪念碑、政治宣传和叙事艺术的综合体，深刻影响了西方纪念碑传统。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.ANCIENT,
    source: '耶鲁大学罗马艺术与考古课程题',
    difficulty: 2,
    tags: '古罗马,凯旋柱,图拉真,浮雕',
  },
  {
    content: '文艺复兴时期的"湿壁画"（Fresco）技法是指什么？',
    options: [
      '在干燥墙壁上用油彩作画',
      '将颜料涂抹于新鲜湿石灰砂浆上，颜料与砂浆化学结合，干燥后颜色成为墙壁的一部分',
      '用蜡封固颜料于墙壁上',
      '在画布上作画后贴于墙面',
    ],
    answer: '1',
    explanation:
      '"湿壁画"（Buon Fresco）要求画家在每日新敷的湿石灰（intonaco）层上迅速作画，颜料中的颜色被碳酸钙结晶包裹而永久固定，是西斯廷礼拜堂、梵蒂冈宫等伟大壁画的技法基础。',
    type: QuestionType.SINGLE_CHOICE,
    period: ArtPeriod.RENAISSANCE,
    source: '哈佛大学意大利文艺复兴技法课程题',
    difficulty: 1,
    tags: '文艺复兴,湿壁画,绘画技法',
  },
];

export const SEED_QUESTIONS: CreateQuestionDto[] = BASE_SEED_QUESTIONS.map(
  attachAuthoritativeSourceMetadata,
);
