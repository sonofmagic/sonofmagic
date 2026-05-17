import type { ITranslation } from '../type'
import { getProfileExperienceYears, profileData } from '@/constants'
import { ansis, emoji, profileTheme } from '@/util'

const { name, nickname } = profileData
const theme = profileTheme
const experienceYears = getProfileExperienceYears()

export const translation: ITranslation = {
  welcome: '我是 {{nickname}}，这里是我的终端名片',
  promptMsg: `${theme.colors.prompt('请选择')} 想看的内容`,
  profile: {
    title: '关于我',
    description: '我主要写小程序工程化、前端构建和能落地的工程工具',
    content: [
      `${ansis.bold(name)} · ${theme.colors.primary('Engineering Portfolio')}`,
      `\n\n${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${experienceYears}`,
      )} 年产品和工程一线 | ${emoji.get('rocket')} 写能落地的工具，做能长期跑的系统`,
      `\n\n${theme.colors.heading('|')} 我比较擅长`,
      '\n把业务问题拆成工程方案，把复杂流程收进工具链',
      `\n\n${theme.colors.heading('|')} 常用技术`,
      '\n小程序、前端构建、Node.js、Serverless、自动化脚本和工程工具',
      `\n\n${theme.colors.heading('|')} 合作习惯`,
      `\n${emoji.get('handshake')} 先讲清目标 | ${emoji.get('hourglass')} 提前说清取舍 | ${emoji.get('chart_with_upwards_trend')} 用结果校验`,
      `\n\n${theme.colors.heading('|')} 做过的事`,
      '\n做过从 0 到 1 的项目，也维护过长期演进的工具链；更在意代码能不能进生产、能不能继续维护',
      `\n\n${theme.colors.heading('|')} 技术树`,
      '\n{{projectsTree}}',
      '\n如果你也在做小程序、构建工具或工程效率，可以聊聊。',
    ].join(''),
    position: '全栈架构工程师 / 技术负责人',
    job: '做平台工程和全栈架构相关工作',
    summaryTitle: '简介',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(`${experienceYears}`)} 年产品和工程一线 | ${emoji.get('sparkles')} 写工具链、做自动化，也处理真实项目里的工程债`,
    ].join('\n'),
    strengthsTitle: '我比较擅长',
    strengths: [
      `${emoji.get('rocket')} 长期维护小程序相关工具，知道真实项目会卡在哪些地方`,
      `${emoji.get('memo')} 把重复流程做成脚本、插件或发布链路，减少手工步骤`,
      `${emoji.get('chart_with_upwards_trend')} 写代码时会同时看性能、稳定性和后续维护成本`,
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
      `${emoji.get('point_right')} 少做花活，更看重半年后还能维护`,
    ].join('\n'),
    experienceTitle: '一些经历',
    experience: [
      '2016 至今：陆续写了一些和小程序工作流、构建流程有关的开源工具',
      '2021 至今：维护 weapp-tailwindcss，把 Tailwind 的写法带到微信小程序项目里',
      '2024 至今：发布 weapp-vite，把小程序项目接到更现代的构建流程里',
      '2026 至今：推出 mokup，用文件路由的方式处理开发和构建时的 Mock',
    ].join('\n'),
    projectsTitle: '项目树',
    projects: '{{projectsTree}}',
    closingTitle: '可以聊什么',
    closing: [
      '小程序工程化、跨端架构、构建性能、工具链设计，都可以聊。',
      '常用公开渠道：GitHub / Juejin / Blog / X。',
    ].join('\n'),
  },
  heroBanner: {
    accent: '{{years}} 年产品与工程一线 | {{position}}',
    tagline: 'TypeScript · Web · Cloud Native\n写能落地的工具，做能长期跑的系统。',
  },
  contact: {
    title: '联系方式',
    description: 'GitHub、Juejin、博客和 X 都能找到我',
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
        detail: '最早是为了解决自己在小程序和构建流程里遇到的问题。',
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
  },
  page: '页码',
  next: '下一张',
  prev: '上一张',
  exit: '退出请按',

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
