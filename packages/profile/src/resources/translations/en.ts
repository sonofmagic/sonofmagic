import type { ITranslation } from '../type'
import { profileData } from '@/constants'
import { ansis, dayjs, emoji, profileTheme } from '@/util'
import { translation as zhTranslation } from './zh'

const { name, nickname, whenToStartWork } = profileData
const theme = profileTheme

function cloneTranslation(source: ITranslation): ITranslation {
  return JSON.parse(JSON.stringify(source)) as ITranslation
}

export const translation: ITranslation = (() => {
  const base = cloneTranslation(zhTranslation)

  base.welcome = 'Welcome to the {{nickname}} profile console'
  base.promptMsg = `${theme.colors.prompt('Please choose')} an item below to continue`

  base.profile = {
    ...base.profile,
    title: 'Personal Information',
    description: `Preview {{nickname}}'s core highlights`,
    job: 'Full-stack engineer',
    position: 'Entrepreneur / Core Developer',
    summaryTitle: 'Snapshot',
    summary: [
      `${ansis.bold(name)} (${theme.colors.primary(nickname)})`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${dayjs().year() - whenToStartWork.year()}`,
      )}+ years in product & engineering | ${emoji.get('mortar_board')} Yangzhou University · Software Engineering`,
    ].join('\n'),
    strengthsTitle: 'Strengths',
    strengths: [
      `${emoji.get('sparkles')} Energised by engineering craft, focused on quality & UX`,
      `${emoji.get('memo')} Knowledge amplifier with continuous open-source deliveries`,
      `${emoji.get('rocket')} Outcome-driven, steady even under fast-paced delivery`,
    ].join('\n'),
    skillsTitle: 'Toolbelt',
    skills: [
      `${emoji.get('satellite')} Node.js · Cloudflare Workers · Edge Runtime · Deno Deploy`,
      `${emoji.get('gear')} Hono / Express / NestJS · Serverless APIs · BFF`,
      `${emoji.get('hammer')} Vite / Webpack / Rollup / Rolldown · Turborepo / Nx · Vitest / Playwright`,
      `${emoji.get('computer')} SSR / SSG · Micro-frontend · Vue / React · Mini Programs (Taro / Uni-app)`,
      `${emoji.get('chart_with_upwards_trend')} Performance & observability: Bundle Analyze · Lighthouse · RUM · Grafana`,
    ].join('\n'),
    expectationTitle: 'Ideal collaboration',
    expectation: [
      `${emoji.get('handshake')} Mutual trust and shared wins`,
      `${emoji.get('hourglass')} Respectful cadence, outcome focused`,
      `${emoji.get('point_right')} Healthy work-life balance ${emoji.get('laughing')}${emoji.get('joy')}`,
    ].join('\n'),
    experienceTitle: 'Experience highlights',
    experience: [
      'Navigated both enterprise and startup teams, versed in 0→1 and 1→N delivery',
      'Former partner owning core delivery, balancing product metrics and team growth',
    ].join('\n'),
    projectsTitle: 'Project tree',
    projects: '{{projectsTree}}',
    closingTitle: 'Let’s connect',
    closing: [
      'Let’s talk engineering practice, product experience, and team empowerment',
      '“Life flows on, yet the moon over the river returns each year.”',
    ].join('\n'),
  }

  base.heroBanner = {
    accent: '{{years}}+ years in product & engineering | {{position}}',
    tagline: 'Node.js · Web · Cloud Native\nPowered by sharing and open source — ready to break the ice!',
  }

  base.contact = {
    title: 'Contact',
    description: `How to reach {{nickname}}`,
  }

  base.photo = {
    title: 'Portrait',
    description: 'Generated with sonofmagic/ascii-art-avatar',
  }

  base.blogWeb = {
    title: 'Blog · Website',
    description: 'https://www.icebreaker.top/',
  }

  base.blogMp = {
    title: 'Blog - WeChat Mini Program',
    description: 'Search "破冰客" inside WeChat',
  }

  base.music = {
    title: 'Music',
    description: `Launch the ${theme.colors.primaryStrong('default')} system player`,
  }

  base.quit = {
    title: 'Sign out',
    description: 'Leave the console',
    promptMsg: 'Are you sure you want to exit?',
    successExitString: `${theme.colors.success('√')} ${theme.colors.successStrong('Exit succeeded!')}`,
  }

  base.changeLanguage = {
    title: 'Switch language',
    description: 'Chinese and English are currently available',
    selectMsg: 'Pick your preferred language',
  }

  base.wechat = {
    id: 'WeChat ID',
    scan: 'Open WeChat and scan',
    search: 'Search in WeChat',
  }

  base.page = 'page'
  base.next = 'next'
  base.prev = 'previous'
  base.exit = 'exit'

  base.directAccess = 'Direct access'
  base.openWithBrowser = 'Open in browser?'

  base.myRepositories = {
    title: 'Open-source projects',
    description: 'Fetched from GitHub',
    loading: {
      text: 'Fetching repositories from GitHub...',
      failText: 'Request failed - please check the network connection and retry.',
    },
    promptMsg: 'Repositories',
  }

  base.leaveMeMessage = {
    title: 'Leave me a message',
    description: 'Drop a few lines',
    prompt: {
      message: 'Please fill out the form below',
      choices: {
        title: 'Title',
        body: 'Content',
      },
      validate: {
        required: {
          title: 'Title is required',
          body: 'Content is required',
        },
      },
      loading: {
        text: 'Posting the message to my serverless function...',
        failText: 'Submission failed - maybe I forgot to top up Aliyun.',
      },
      successMsg: 'Message sent successfully!',
    },
  }

  base.about = 'About'
  base.cardMp = {
    title: 'Developer card mini app',
    description: 'GitHub business card in WeChat mini program',
  }

  return base
})()

export default {
  translation,
}
