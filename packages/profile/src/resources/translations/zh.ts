import type { ITranslation } from '../type'
import { profileData } from '@/constants'
import { ansis, dayjs, emoji, profileTheme } from '@/util'

const { name, nickname, whenToStartWork } = profileData
const theme = profileTheme

export const translation: ITranslation = {
  welcome: '欢迎来到 {{nickname}} 的工程履历终端',
  promptMsg: `${theme.colors.prompt('请选择')} 你想深入查看的模块`,
  profile: {
    title: '工程档案',
    description: '聚焦微信小程序工作流、前端构建系统与部署自动化的能力画像',
    content: [
      `${ansis.bold(name)} · ${theme.colors.primary('Engineering Portfolio')}`,
      `\n\n${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${dayjs().year() - whenToStartWork.year()}`,
      )} 年产品与工程实战 | ${emoji.get('rocket')} 聚焦高可用与高性能交付`,
      `\n\n${theme.colors.heading('|')} 核心优势`,
      '\n系统化工程思维，兼顾架构前瞻性与落地确定性',
      `\n\n${theme.colors.heading('|')} 技术版图`,
      '\n跨端开发、云原生运行时、平台工程与自动化质量体系',
      `\n\n${theme.colors.heading('|')} 协作偏好`,
      `\n${emoji.get('handshake')} 目标一致 | ${emoji.get('hourglass')} 节奏清晰 | ${emoji.get('chart_with_upwards_trend')} 结果可度量`,
      `\n\n${theme.colors.heading('|')} 项目经历`,
      '\n覆盖 0-1 创新项目与 1-N 规模化演进，关注业务价值和长期可维护性',
      `\n\n${theme.colors.heading('|')} 项目结构`,
      '\n{{projectsTree}}',
      '\n欢迎交流工程实践、架构演进与团队协作方法。',
    ].join(''),
    position: 'Staff+ 全栈架构工程师 / 技术负责人',
    job: '作为平台工程与全栈架构工程师',
    summaryTitle: '概要',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(`${dayjs().year() - whenToStartWork.year()}`)} 年产品与工程实战 | ${emoji.get('sparkles')} 生产级工具链 + DX 指标 + 自动化发布`,
    ].join('\n'),
    strengthsTitle: '核心优势',
    strengths: [
      `${emoji.get('rocket')} 长期维护小程序生态工具链，强调可落地与可复用`,
      `${emoji.get('memo')} 通过 DX 指标与自动化发布流程提升团队交付确定性`,
      `${emoji.get('chart_with_upwards_trend')} 兼顾性能、稳定性与研发效率，持续推进工程演进`,
    ].join('\n'),
    skillsTitle: '技术栈',
    skills: [
      `${emoji.get('hammer')} 前端工程：Nuxt / Vue 组件体系 / 性能评审 / React`,
      `${emoji.get('gear')} Node.js 平台：Express / Koa / NestJS / Hono / API 部署`,
      `${emoji.get('satellite')} Serverless：Cloudflare Workers / Edge Functions / 定时任务`,
      `${emoji.get('computer')} 工具链研发：Tailwind 转换 / Vite 插件 / Monorepo 自动化 / DX 指标`,
      `${emoji.get('chart_with_upwards_trend')} 编译与构建：Babel / PostCSS / Webpack / Vite / Rolldown / Rspack`,
    ].join('\n'),
    expectationTitle: '合作方式',
    expectation: [
      `${emoji.get('handshake')} 目标清晰、信任透明、对结果负责`,
      `${emoji.get('hourglass')} 重视节奏管理与高质量评审反馈`,
      `${emoji.get('point_right')} 追求长期主义的工程文化`,
    ].join('\n'),
    experienceTitle: '经历亮点',
    experience: [
      '2016 至今：持续发布面向小程序工作流与构建流程的开源工具',
      '2021 至今：维护 weapp-tailwindcss，推动 Tailwind 在微信生态的工程化落地',
      '2024 至今：发布 weapp-vite，让小程序项目与现代前端栈对齐',
      '2026 至今：推出 mokup，覆盖 Vite、CLI 构建与运行时适配的文件路由 Mock 工具链',
    ].join('\n'),
    projectsTitle: '项目树',
    projects: '{{projectsTree}}',
    closingTitle: '进一步交流',
    closing: [
      '欢迎交流平台工程、跨端架构、性能优化与工程组织实践。',
      '公开渠道：GitHub / Juejin / Blog / X。',
    ].join('\n'),
  },
  heroBanner: {
    accent: '{{years}} 年产品与工程经验 | {{position}}',
    tagline: 'TypeScript · Web · Cloud Native\nArchitecture-minded, delivery-focused, quality-first.',
  },
  contact: {
    title: '公开联系方式',
    description: '通过 GitHub、Juejin、博客与 X 建立连接',
  },
  photo: {
    title: '视觉档案',
    description: '由 sonofmagic/ascii-art-avatar 生成',
  },
  blogWeb: {
    title: '技术主页',
    description: '公开技术站点与长期内容沉淀',
  },
  blogMp: {
    title: '项目索引',
    description: '开源项目与技术专题聚合入口',
  },
  music: {
    title: '音乐',
    description: `调用 ${theme.colors.primaryStrong('默认')} 系统播放器`,
  },
  quit: {
    title: '退出',
    description: '退出终端界面',
    promptMsg: '确定退出吗?',
    successExitString: `${theme.colors.success('√')} ${theme.colors.successStrong('退出成功!')}`,
  },
  changeLanguage: {
    title: '切换语言',
    selectMsg: '选择你的语言',
    description: '目前支持中文和英文',
  },
  wechat: {
    id: '公开渠道',
    scan: '扫码访问',
    search: '站内搜索',
  },
  page: '页码',
  next: '下一张',
  prev: '上一张',
  exit: '退出请按',

  directAccess: '直接访问',
  openWithBrowser: '是否直接用浏览器打开?',
  myRepositories: {
    title: '开源项目',
    description: '重点仓库：weapp-tailwindcss / weapp-vite / mokup',
    loading: {
      text: '正在从 GitHub 拉取数据...',
      failText: '拉取失败，请检查网络连接后重试',
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
        text: '正在提交数据到我的 serverless 函数中... ',
        failText: '提交失败，请稍后重试',
      },
    },
  },
  about: '关于',
  cardMp: {
    description: '公开开发者档案',
    title: '开发者名片',
  },
}

export default {
  translation,
}
