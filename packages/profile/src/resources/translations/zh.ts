import type { ITranslation } from '../type'
import { getProfileExperienceYears, profileData } from '@/constants'
import { ansis, emoji, profileTheme } from '@/util'

const { name, nickname } = profileData
const theme = profileTheme
const experienceYears = getProfileExperienceYears()

export const translation: ITranslation = {
  welcome: '我是 {{nickname}}，这里是我的终端名片',
  promptMsg: `${theme.colors.prompt('请选择')} 想看的内容`,
  promptHint: '方向键 / 回车 / L 切语言 / Q 或 Esc 返回',
  profile: {
    title: '关于我',
    description: '喜欢开源。内部用着顺手的小工具，如果别人也可能用得上，我就想把它整理出来',
    content: [
      `${ansis.bold(name)} · ${theme.colors.primary('Engineering Portfolio')}`,
      `\n\n${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${experienceYears}`,
      )} 年产品和工程一线 | ${emoji.get('rocket')} 写代码，也折腾工具。能开源的，我一般会尽量开源`,
      `\n\n${theme.colors.heading('|')} 我比较擅长`,
      '\n把一团乱的问题拆开，先让它能跑，再把重复的部分收进工具里',
      `\n\n${theme.colors.heading('|')} 常用技术`,
      '\nTypeScript、Web 架构、Node.js、Serverless、构建系统和自动化脚本',
      `\n\n${theme.colors.heading('|')} 合作习惯`,
      `\n${emoji.get('handshake')} 先讲清目标 | ${emoji.get('hourglass')} 提前说清取舍 | ${emoji.get('chart_with_upwards_trend')} 用结果校验`,
      `\n\n${theme.colors.heading('|')} 做过的事`,
      '\n做过从 0 到 1 的产品，也维护过需要经常修修补补的开源项目。比起写得漂亮，我更在意它半年后还能不能改',
      `\n\n${theme.colors.heading('|')} 技术树`,
      '\n{{projectsTree}}',
      '\n如果你也在写工具、做开源，或者只是被工程里的重复劳动烦到了，可以聊聊。',
    ].join(''),
    position: '全栈架构工程师 / 技术负责人',
    job: '做平台工程和全栈架构相关工作',
    summaryTitle: '简介',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(`${experienceYears}`)} 年产品和工程一线 | ${emoji.get('sparkles')} 开源爱好者，平时写全栈、工具链和自动化比较多`,
    ].join('\n'),
    strengthsTitle: '我比较擅长',
    strengths: [
      `${emoji.get('rocket')} 能从产品目标聊到代码细节，中间的坑也愿意一起填`,
      `${emoji.get('memo')} 真实项目里反复踩到的坑，我会顺手做成工具、插件或发布脚本`,
      `${emoji.get('chart_with_upwards_trend')} 写代码时会想性能和稳定性，也会想下一个接手的人会不会骂我`,
    ].join('\n'),
    skillsTitle: '技术栈',
    skills: [
      `${emoji.get('hammer')} 前端：Nuxt / Vue 组件体系 / 性能优化 / React`,
      `${emoji.get('gear')} Node.js：Express / Koa / NestJS / Hono / API 部署`,
      `${emoji.get('satellite')} Serverless：Cloudflare Workers / Edge Functions / 定时任务`,
      `${emoji.get('computer')} 工具链：Tailwind 转换 / Vite 插件 / Monorepo 自动化 / 工程流程治理`,
      `${emoji.get('chart_with_upwards_trend')} 编译与构建：Babel / PostCSS / Webpack / Vite / Rolldown / Rspack`,
    ].join('\n'),
    expectationTitle: '我喜欢的合作方式',
    expectation: [
      `${emoji.get('handshake')} 先讲清要解决的问题，再定实现路径`,
      `${emoji.get('hourglass')} 节奏可以快，关键取舍必须提前说清`,
      `${emoji.get('point_right')} 少做花活。代码过半年再看，还能改，这点很重要`,
    ].join('\n'),
    experienceTitle: '一些经历',
    experience: [
      '2016 至今：一边做产品和工程，一边把顺手的东西整理成开源项目',
      '2021 至今：维护 weapp-tailwindcss，主要解决样式、构建适配和团队写法统一的问题',
      '2024 至今：发布 weapp-vite，想让老项目也能有更快的开发反馈和插件化构建',
      '2026 至今：推出 mokup，用文件路由组织 Mock，少写一点重复配置',
    ].join('\n'),
    projectsTitle: '项目树',
    projects: '{{projectsTree}}',
    closingTitle: '可以聊什么',
    closing: [
      '可以从开源维护、全栈架构、构建性能、自动化，或者团队每天都要用的小工具聊起。',
      '常用公开渠道：GitHub / Juejin / Blog / X。',
    ].join('\n'),
    menuPrompt: '想看哪部分关于我的内容?',
  },
  heroBanner: {
    accent: '{{years}} 年产品与工程一线 | {{position}}',
    tagline: 'TypeScript · Web · Cloud Native\n写工具，也写上线后还要继续养的系统。',
  },
  contact: {
    title: '联系方式',
    description: 'GitHub、Juejin、博客和 X 都能找到我',
  },
  shareCenter: {
    title: '分享中心',
    description: '这些入口能直接找到我和我的项目',
    targetPrompt: '想分享哪个入口?',
    actionPrompt: '对 {{target}} 做什么?',
    shareTitle: '{{nickname}} 的 {{target}}',
    shareIntro: '这是 {{name}} 的 {{target}} 入口，可以直接打开链接，也可以用 npx 在终端里查看。',
    commandLabel: '终端命令',
    linkLabel: '链接',
    qrCommandLabel: '二维码命令',
    opened: '已打开 {{target}}: {{url}}',
    targets: {
      github: 'GitHub',
      website: '主页',
      repositories: '项目列表',
      juejin: '掘金',
      blog: '博客',
      x: 'X',
    },
    actions: {
      qrcode: '显示二维码',
      open: '用浏览器打开',
      shareText: '生成分享文本',
      back: '重新选择入口',
    },
  },
  arcade: {
    title: '游戏',
    description: '2048 和以后更多终端小游戏',
    menuPrompt: '想玩哪个游戏?',
    score: '分数',
    gameOver: '游戏结束，最终分数 {{score}}',
    games: {
      game2048: {
        title: '2048',
        description: '移动数字块，合成更大的数字',
        controls: 'WASD / 方向键移动 · U 撤销 · R 重开 · Q 退出',
        moves: '步数',
        bestTile: '最大',
        bestScore: '最高',
        keepGoing: '已经到 2048，继续冲更高分。',
        noMove: '这个方向移动不了。',
        noMoves: '没有可移动的格子了。',
        noUndo: '没有可以撤销的上一步。',
        restart: '新局开始。',
        rawModeUnavailable: '当前终端不支持实时按键输入，2048 需要在交互式 TTY 里运行。',
        undo: '已撤销一步。',
        win: '合成 2048，继续玩可以刷更高分。',
      },
    },
  },
  photo: {
    title: '照片',
    description: '一张终端里能看的头像',
  },
  timeline: {
    title: '时间线',
    description: '按年份看几个主要项目',
    items: {
      openSource: {
        title: '开始写开源工具',
        detail: '最早是为了解决自己在产品、工程协作和构建流程里遇到的问题。',
      },
      weappTailwindcss: {
        title: 'weapp-tailwindcss',
        detail: '把 Tailwind 的 utility 写法接到微信小程序项目里。',
      },
      weappVite: {
        title: 'weapp-vite',
        detail: '把小程序项目接到更现代的构建流程里。',
      },
      mokup: {
        title: 'mokup',
        detail: '用文件路由组织 Mock，开发、构建和运行时都能接。',
      },
    },
  },
  blogWeb: {
    title: '主页',
    description: '一些文章和项目记录',
  },
  blogMp: {
    title: '项目索引',
    description: '开源项目和技术专题放在这里',
  },
  music: {
    title: '音乐',
    description: `用系统${theme.colors.primaryStrong('默认')}播放器打开`,
  },
  quit: {
    title: '退出',
    description: '不看了，退出',
    promptMsg: '确定退出吗?',
    successExitString: `${theme.colors.success('√')} ${theme.colors.successStrong('已退出')}`,
  },
  changeLanguage: {
    title: '切换语言',
    selectMsg: '想用哪种语言?',
    description: '中文 / English',
    shortcutHint: 'L 语言 {{language}} -> {{nextLanguage}}',
  },
  page: '页码',
  next: '下一张',
  prev: '上一张',
  exit: '退出请按',
  back: '返回',

  directAccess: '直接打开',
  openWithBrowser: '用浏览器打开吗?',
  myRepositories: {
    title: '开源项目',
    description: '我主要维护的几个仓库',
    loading: {
      text: '正在从 GitHub 取数据...',
      failText: '没取到数据，可以检查一下网络后再试',
      fallbackText: '暂时连不上 GitHub，先看内置的几个项目',
    },
    promptMsg: '选一个项目',
    actions: {
      open: '打开仓库',
      details: '看看详情',
      qrcode: '显示二维码',
      shareText: '生成分享文本',
      back: '回到列表',
    },
    detail: {
      language: '语言',
      stars: 'Stars',
      forks: 'Forks',
      url: '链接',
      spotlight: '一句话',
      bestFor: '适合用在',
      noDescription: '这个仓库暂时没有写描述',
      shareTitle: '{{name}} 仓库',
      shareIntro: '可以直接打开这个仓库，也可以用 npx 跳到完整项目索引。',
      commandLabel: '项目索引命令',
    },
    spotlights: {
      weappTailwindcss: {
        tagline: '在微信小程序里写 Tailwind。',
        bestFor: 'Tailwind 设计系统、小程序构建接入、统一团队里的 UI 写法',
      },
      weappVite: {
        tagline: '把小程序项目接到 Vite 风格的构建流程里。',
        bestFor: '本地反馈、插件化构建、老项目渐进迁移',
      },
      mokup: {
        tagline: '用文件路由管理 Mock。',
        bestFor: 'API Mock 路由、Vite 接入、CLI 和运行时适配',
      },
    },
  },

  leaveMeMessage: {
    title: '给我留言',
    description: '留一段话',
    prompt: {
      message: '写点什么吧',
      successMsg: '留言发出去了',
      choices: {
        title: '标题',
        body: '正文',
      },
      validate: {
        required: {
          body: '正文还没写',
          title: '标题还没写',
        },
      },
      loading: {
        text: '正在提交留言... ',
        failText: '提交失败了，晚点再试一次',
      },
    },
  },
  about: '关于',
}

export default {
  translation,
}
