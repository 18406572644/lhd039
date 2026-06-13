export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

export const DIFFICULTY_CONFIG = {
  [DIFFICULTY.EASY]: {
    name: '简单',
    desc: '常用汉字，无标点',
    color: '#52c41a'
  },
  [DIFFICULTY.MEDIUM]: {
    name: '中等',
    desc: '包含标点符号',
    color: '#faad14'
  },
  [DIFFICULTY.HARD]: {
    name: '困难',
    desc: '中英混排 + 生僻字',
    color: '#ff4d4f'
  }
}

export const CATEGORIES = {
  PROSE: 'prose',
  NOVEL: 'novel',
  ENGLISH: 'english',
  POETRY: 'poetry',
  CLASSIC: 'classic'
}

export const CATEGORY_CONFIG = {
  [CATEGORIES.PROSE]: { name: '散文', icon: '📖' },
  [CATEGORIES.NOVEL]: { name: '小说', icon: '📚' },
  [CATEGORIES.ENGLISH]: { name: '英文短文', icon: '🔤' },
  [CATEGORIES.POETRY]: { name: '诗词', icon: '🎋' },
  [CATEGORIES.CLASSIC]: { name: '古文', icon: '📜' }
}

export const TYPING_PARAGRAPHS = [
  {
    id: 1,
    title: '荷塘月色（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.EASY,
    content: '这几天心里颇不宁静今晚在院子里坐着乘凉忽然想起日日走过的荷塘在这满月的光里总该另有一番样子吧月亮渐渐地升高了墙外马路上孩子们的欢笑已经听不见了妻在屋里拍着闰儿迷迷糊糊地哼着眠歌我悄悄地披了大衫带上门出去'
  },
  {
    id: 2,
    title: '春（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.EASY,
    content: '盼望着盼望着东风来了春天的脚步近了一切都像刚睡醒的样子欣欣然张开了眼山朗润起来了水涨起来了太阳的脸红起来了小草偷偷地从土里钻出来嫩嫩的绿绿的园子里田野里瞧去一大片一大片满是的坐着躺着打两个滚踢几脚球赛几趟跑捉几回迷藏风轻悄悄的草软绵绵的'
  },
  {
    id: 3,
    title: '从百草园到三味书屋（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.EASY,
    content: '不必说碧绿的菜畦光滑的石井栏高大的皂荚树紫红的桑椹也不必说鸣蝉在树叶里长吟肥胖的黄蜂伏在菜花上轻捷的叫天子忽然从草间直窜向云霄里去了单是周围的短短的泥墙根一带就有无限趣味油蛉在这里低唱蟋蟀们在这里弹琴'
  },
  {
    id: 4,
    title: '匆匆（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.MEDIUM,
    content: '燕子去了，有再来的时候；杨柳枯了，有再青的时候；桃花谢了，有再开的时候。但是，聪明的，你告诉我，我们的日子为什么一去不复返呢？——是有人偷了他们罢：那是谁？又藏在何处呢？是他们自己逃走了罢：现在又到了哪里呢？'
  },
  {
    id: 5,
    title: '背影（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.MEDIUM,
    content: '我看见他戴着黑布小帽，穿着黑布大马褂，深青布棉袍，蹒跚地走到铁道边，慢慢探身下去，尚不大难。可是他穿过铁道，要爬上那边月台，就不容易了。他用两手攀着上面，两脚再向上缩；他肥胖的身子向左微倾，显出努力的样子。'
  },
  {
    id: 6,
    title: '故都的秋（节选）',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.MEDIUM,
    content: '秋天，无论在什么地方的秋天，总是好的；可是啊，北国的秋，却特别地来得清，来得静，来得悲凉。我的不远千里，要从杭州赶上青岛，更要从青岛赶上北平来的理由，也不过想饱尝一尝这"秋"，这故都的秋味。'
  },
  {
    id: 7,
    title: '呐喊·自序（节选）',
    category: CATEGORIES.NOVEL,
    difficulty: DIFFICULTY.EASY,
    content: '我在年青时候也曾经做过许多梦后来大半忘却了但自己也并不以为可惜所谓回忆者虽说可以使人欢欣有时也不免使人寂寞使精神的丝缕还牵着已逝的寂寞的时光又有什么意味呢而我偏苦于不能全忘却这不能全忘的一部分到现在便成了呐喊的来由'
  },
  {
    id: 8,
    title: '红楼梦（节选）',
    category: CATEGORIES.NOVEL,
    difficulty: DIFFICULTY.MEDIUM,
    content: '却说宝玉自见了秦钟，心中便如有所失，痴了半日。自己心中又起了呆意，自思道："天下竟有这等人物！如今看来，我竟成了泥猪癞狗了。可恨我为什么生在这侯门公府之家？若也生在寒门薄宦之家，早得与他交结，也不枉生了一世。"'
  },
  {
    id: 9,
    title: '西游记（节选）',
    category: CATEGORIES.NOVEL,
    difficulty: DIFFICULTY.MEDIUM,
    content: '那座山正当顶上，有一块仙石。其石有三丈六尺五寸高，有二丈四尺围圆。上有九窍八孔，按九宫八卦。四面更无树木遮阴，左右倒有芝兰相衬。盖自开辟以来，每受天真地秀，日精月华，感之既久，遂有灵通之意。内育仙胞，一日迸裂，产一石卵，似圆球样大。'
  },
  {
    id: 10,
    title: '静夜思',
    category: CATEGORIES.POETRY,
    difficulty: DIFFICULTY.EASY,
    content: '床前明月光疑是地上霜举头望明月低头思故乡'
  },
  {
    id: 11,
    title: '春晓',
    category: CATEGORIES.POETRY,
    difficulty: DIFFICULTY.EASY,
    content: '春眠不觉晓处处闻啼鸟夜来风雨声花落知多少'
  },
  {
    id: 12,
    title: '登鹳雀楼',
    category: CATEGORIES.POETRY,
    difficulty: DIFFICULTY.EASY,
    content: '白日依山尽黄河入海流欲穷千里目更上一层楼'
  },
  {
    id: 13,
    title: '水调歌头',
    category: CATEGORIES.POETRY,
    difficulty: DIFFICULTY.MEDIUM,
    content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。'
  },
  {
    id: 14,
    title: '将进酒',
    category: CATEGORIES.POETRY,
    difficulty: DIFFICULTY.MEDIUM,
    content: '君不见，黄河之水天上来，奔流到海不复回。君不见，高堂明镜悲白发，朝如青丝暮成雪。人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。烹羊宰牛且为乐，会须一饮三百杯。'
  },
  {
    id: 15,
    title: '论语（节选）',
    category: CATEGORIES.CLASSIC,
    difficulty: DIFFICULTY.MEDIUM,
    content: '子曰："学而时习之，不亦说乎？有朋自远方来，不亦乐乎？人不知而不愠，不亦君子乎？"有子曰："其为人也孝弟，而好犯上者，鲜矣；不好犯上，而好作乱者，未之有也。君子务本，本立而道生。孝弟也者，其为仁之本与！"'
  },
  {
    id: 16,
    title: '道德经（节选）',
    category: CATEGORIES.CLASSIC,
    difficulty: DIFFICULTY.HARD,
    content: '道可道，非常道；名可名，非常名。无名天地之始，有名万物之母。故常无欲以观其妙，常有欲以观其徼。此两者同出而异名，同谓之玄，玄之又玄，众妙之门。'
  },
  {
    id: 17,
    title: '英语短文 - 人生的意义',
    category: CATEGORIES.ENGLISH,
    difficulty: DIFFICULTY.MEDIUM,
    content: 'The meaning of life is a question that has been asked by philosophers, scientists, and ordinary people throughout history. While there is no single answer that satisfies everyone, many people find meaning in relationships, work, creativity, and personal growth. The journey of discovering meaning is often as important as the answer itself.'
  },
  {
    id: 18,
    title: '英语短文 - 四季',
    category: CATEGORIES.ENGLISH,
    difficulty: DIFFICULTY.EASY,
    content: 'Spring is the season of new life Flowers bloom and trees turn green Summer brings warm weather and long days People enjoy swimming and outdoor activities Autumn paints the world in red and gold Winter covers everything in snow Each season has its own beauty and charm'
  },
  {
    id: 19,
    title: '英语短文 - 坚持的力量',
    category: CATEGORIES.ENGLISH,
    difficulty: DIFFICULTY.MEDIUM,
    content: 'Success is not always about talent, but often about persistence. The difference between those who achieve their goals and those who do not is the willingness to keep trying, even when things get difficult. Every expert was once a beginner, and every master was once a disaster. Keep going, and you will eventually reach your destination.'
  },
  {
    id: 20,
    title: '中英混排 - 科技与生活',
    category: CATEGORIES.ENGLISH,
    difficulty: DIFFICULTY.HARD,
    content: '在当今这个 digital age（数字时代），人工智能（AI）正深刻地改变着我们的生活方式。从 smartphone（智能手机）到 smart home（智能家居），从 online shopping（在线购物）到 social media（社交媒体），technology 让世界变得更加 connected（互联互通）。然而，我们也需要 balance（平衡）虚拟与现实，保持真实的 human connection（人际连接）。'
  },
  {
    id: 21,
    title: '生僻字练习',
    category: CATEGORIES.CLASSIC,
    difficulty: DIFFICULTY.HARD,
    content: '魑魅魍魉貔貅饕餮夔牛獬豸麒麟凤凰龙龟赑屃狴犴狻猊睚眦囚牛椒图蒲牢螭吻这些都是中国传统文化中神话传说里经常出现的神兽或精怪的名字虽然有些字我们平时不常用但是了解它们也是对中华文化的一种传承和学习'
  },
  {
    id: 22,
    title: '滕王阁序（节选）',
    category: CATEGORIES.CLASSIC,
    difficulty: DIFFICULTY.HARD,
    content: '豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊采星驰。台隍枕夷夏之交，宾主尽东南之美。都督阎公之雅望，棨戟遥临；宇文新州之懿范，襜帷暂驻。'
  },
  {
    id: 23,
    title: '人生感悟',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.MEDIUM,
    content: '生活中总有些不期而遇的温暖，让人瞬间感动。也许是陌生人的一个微笑，也许是朋友一句关心的话语，也许是家人默默的支持。这些看似微小的瞬间，汇聚成了我们生命中最珍贵的记忆。珍惜当下，感恩遇见，让每一天都充满阳光和希望。'
  },
  {
    id: 24,
    title: '童年回忆',
    category: CATEGORIES.PROSE,
    difficulty: DIFFICULTY.EASY,
    content: '小时候的夏天总是那么漫长蝉在树上不停地叫着我们在院子里追逐打闹吃着冰镇的西瓜听着爷爷讲古老的故事夕阳西下炊烟袅袅空气中弥漫着饭菜的香味那时候的快乐很简单一块糖一个游戏就能让我们开心一整天'
  },
  {
    id: 25,
    title: 'The Road to Success',
    category: CATEGORIES.ENGLISH,
    difficulty: DIFFICULTY.HARD,
    content: 'It is well that young men should begin at the beginning and occupy the most subordinate positions. Many of the leading businessmen of Pittsburgh had a serious responsibility thrust upon them at the very threshold of their career. They were introduced to the broom, and spent the first hours of their business lives sweeping out the office.'
  }
]

export function getParagraphsByDifficulty(difficulty) {
  return TYPING_PARAGRAPHS.filter(p => p.difficulty === difficulty)
}

export function getParagraphsByCategory(category) {
  return TYPING_PARAGRAPHS.filter(p => p.category === category)
}

export function getRandomParagraph(difficulty = null, category = null) {
  let paragraphs = TYPING_PARAGRAPHS
  if (difficulty) {
    paragraphs = paragraphs.filter(p => p.difficulty === difficulty)
  }
  if (category) {
    paragraphs = paragraphs.filter(p => p.category === category)
  }
  if (paragraphs.length === 0) return null
  return paragraphs[Math.floor(Math.random() * paragraphs.length)]
}
