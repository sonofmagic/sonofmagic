import type { ITranslation } from '../type'
import { profileData } from '@/constants'
import { ansis, dayjs, emoji } from '@/util'

const { gender, name, nickname, whenToStartWork } = profileData

export const translation: ITranslation = {
  welcome: '欢迎来到 {{nickname}} 的互动式履历',
  promptMsg: `${ansis.greenBright('请选择')} 想深入了解的板块`,
  profile: {
    title: '个人信息',
    description: `快速浏览 {{nickname}} 的核心信息`,
    content: [
      `${ansis.bold(name)} ${ansis.greenBright(nickname)} ${ansis.bold.blueBright(gender)}`,
      `\n\n${emoji.get('handbag')} ${ansis.bold.greenBright(
        dayjs().year() - whenToStartWork.year(),
      )} 年经验 | ${emoji.get('mortar_board')} 扬州大学-软件工程-本科`,
      `\n\n${ansis.bold.greenBright('|')} 个人优势`,
      '\n靠谱，对技术还算热爱',
      `\n\n${ansis.bold.greenBright('|')} 个人技能`,
      '\n基本功好想到什么写什么',
      `\n\n${ansis.bold.greenBright('|')} 期望职位`,
      `\n${emoji.get('art')} 钱多 | ${emoji.get('moneybag')} 事少 | ${emoji.get('point_right')} 离家近 ${emoji.get(
        'laughing',
      )}${emoji.get('joy')}`,
      `\n\n${ansis.bold.greenBright('|')} 工作经历`,
      '\n经历过作为打工人,被压榨到看不到希望 \n也经历过作为合伙人,为了一张空头支票而奋不顾身', // ,最终被踢出局
      `\n\n${ansis.bold.greenBright('|')} 项目经历`,
      `\n{{projectsTree}}`,
      '\n> 人生代代无穷已，江月年年只相似',
      '\n 欢迎对技术感兴趣的小伙伴一起交流！',
    ].join(''),
    position: '创业者/核心开发',
    job: '作为全栈开发工程师',
    summaryTitle: '个人简介',
    summary: [
      `${ansis.bold(name)} ${ansis.greenBright(nickname)} ${ansis.bold.blueBright(gender)}`,
      `${emoji.get('handbag')} ${ansis.bold.greenBright(dayjs().year() - whenToStartWork.year())} 年产品与工程经验 | ${emoji.get('mortar_board')} 扬州大学 · 软件工程`,
    ].join('\n'),
    strengthsTitle: '个人优势',
    strengths: [
      `${emoji.get('sparkles')} 长期保持工程热情，关注质量与体验`,
      `${emoji.get('memo')} 擅长知识沉淀与分享，持续输出开源项目`,
      `${emoji.get('rocket')} 结果导向，能在快节奏中稳住交付节奏`,
    ].join('\n'),
    skillsTitle: '技术栈',
    skills: [
      `${emoji.get('satellite')} Node.js · Cloudflare Workers · Edge Runtime · Deno Deploy`,
      `${emoji.get('gear')} Hono / Express / NestJS · Serverless API · BFF`,
      `${emoji.get('hammer')} Vite / Webpack / Rollup / Rolldown · Turborepo / Nx · Vitest / Playwright`,
      `${emoji.get('computer')} SSR / SSG · 微前端 · Vue / React · 微信小程序 (Taro / Uni-app)`,
      `${emoji.get('chart_with_upwards_trend')} 性能 & 观测：Bundle Analyze · Lighthouse · RUM · Grafana`,
    ].join('\n'),
    expectationTitle: '理想合作',
    expectation: [
      `${emoji.get('handshake')} 互信协作，彼此成就`,
      `${emoji.get('hourglass')} 尊重节奏，成果导向`,
      `${emoji.get('point_right')} 工作生活平衡 ${emoji.get('laughing')}${emoji.get('joy')}`,
    ].join('\n'),
    experienceTitle: '经历撷英',
    experience: [
      '穿梭于大型团队与创业团队，熟悉 0-1 / 1-N 的产品推进',
      '曾作为合伙人负责核心交付，对业务指标与团队成长同样关注',
    ].join('\n'),
    projectsTitle: '项目树',
    projects: '{{projectsTree}}',
    closingTitle: '更多交流',
    closing: [
      '欢迎聊聊工程实践、产品体验与团队建设',
      '“人生代代无穷已，江月年年只相似。”',
    ].join('\n'),
  },
  heroBanner: {
    accent: '{{years}} 年产品与工程经验 | {{position}}',
    tagline: 'Node.js · Web · 云原生\n热爱分享与开源，期待和你破冰~',
  },
  contact: {
    title: '联系方式',
    description: `与 {{nickname}} 取得联系的方法`,
  },
  photo: {
    title: '我的照片',
    description: '由 sonofmagic/ascii-art-avatar 生成',
  },
  blogWeb: {
    title: '博客-Web版',
    description: 'https://www.icebreaker.top/',
  },
  blogMp: {
    title: '博客-微信小程序',
    description: '微信搜索破冰客',
  },
  music: {
    title: '音乐',
    description: `调用 ${ansis.bold.greenBright('默认')} 系统播放器`,
  },
  quit: {
    title: '退出',
    description: '退出系统',
    promptMsg: '您确定要退出此系统吗?',
    successExitString: `${ansis.green('√')} ${ansis.greenBright.bold('退出成功!')}`,
  },
  changeLanguage: {
    title: '切换语言',
    selectMsg: '选择你的语言',
    description: '目前支持中文和英文',
  },
  wechat: {
    id: '微信号',
    scan: '打开微信扫一扫',
    search: '微信内搜索',
  },
  page: '页码',
  next: '下一张',
  prev: '上一张',
  exit: '退出请按',

  directAccess: '直接访问',
  openWithBrowser: '是否直接用浏览器打开?',
  myRepositories: {
    title: '我的开源',
    description: '从Github拉取数据',
    loading: {
      text: '从Github拉取数据中...',
      failText: '从Github拉取数据失败，请检查你的网络连接后重试',
    },
    promptMsg: '项目列表',
  },

  leaveMeMessage: {
    title: '给我留言',
    description: '随便写写',
    prompt: {
      message: '请在下方填写',
      successMsg: '留言成功!',
      choices: {
        title: '标题',
        body: '正文',
      },
      validate: {
        required: {
          body: '请填写正文!',
          title: '请填写标题!',
        },
      },
      loading: {
        text: '正在提交数据到我的serverless函数中... ',
        failText: '提交失败，可能是我没给阿里云打钱',
      },
    },
  },
  about: '关于',
  cardMp: {
    description: 'github card in weapp',
    title: '名片小程序',
  },
}

export default {
  translation,
}
