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

  base.welcome = 'Welcome to the {{nickname}} engineering profile terminal'
  base.promptMsg = `${theme.colors.prompt('Please choose')} a module to continue`

  base.profile = {
    ...base.profile,
    title: 'Engineering Profile',
    description: 'Focused on WeChat mini-program workflows, frontend build systems, and deployment automation',
    job: 'As a platform engineering and full-stack architecture engineer',
    position: 'Staff+ Full-stack Architect / Technical Lead',
    summaryTitle: 'Summary',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${dayjs().year() - whenToStartWork.year()}`,
      )}+ years in product & engineering | ${emoji.get('sparkles')} production tooling + DX metrics + release automation`,
    ].join('\n'),
    strengthsTitle: 'Core strengths',
    strengths: [
      `${emoji.get('rocket')} Long-term maintainer of mini-program ecosystem tooling with production adoption`,
      `${emoji.get('memo')} Improves delivery certainty through DX metrics and automated release workflows`,
      `${emoji.get('chart_with_upwards_trend')} Continuously optimizes reliability, performance, and engineering throughput`,
    ].join('\n'),
    skillsTitle: 'Tech stack',
    skills: [
      `${emoji.get('hammer')} Frontend engineering: Nuxt / Vue component systems / performance reviews / React`,
      `${emoji.get('gear')} Node.js platforms: Express / Koa / NestJS / Hono / API deployment`,
      `${emoji.get('satellite')} Serverless operations: Cloudflare Workers / edge functions / scheduled jobs`,
      `${emoji.get('computer')} Toolchain development: Tailwind transforms / Vite plugins / monorepo automation / DX metrics`,
      `${emoji.get('chart_with_upwards_trend')} Build and compiler stack: Babel / PostCSS / Webpack / Vite / Rolldown / Rspack`,
    ].join('\n'),
    expectationTitle: 'Collaboration style',
    expectation: [
      `${emoji.get('handshake')} Shared goals, transparent trust, accountable outcomes`,
      `${emoji.get('hourglass')} Respectful cadence with high-quality review loops`,
      `${emoji.get('point_right')} Long-term engineering mindset`,
    ].join('\n'),
    experienceTitle: 'Experience highlights',
    experience: [
      '2016 → now: publishing open-source tooling for mini-program workflows and build pipelines',
      '2021 → now: maintaining weapp-tailwindcss for Tailwind utility compilation in WeChat projects',
      '2024 → now: shipping weapp-vite to align mini-program projects with modern frontend stacks',
      '2026 → now: launching mokup, a file-based mock toolkit for Vite, CLI builds, and runtime adapters',
    ].join('\n'),
    projectsTitle: 'Project tree',
    projects: '{{projectsTree}}',
    closingTitle: 'Let’s connect',
    closing: [
      'Open to discussions on platform engineering, cross-platform architecture, performance, and team practices.',
      'Public channels: GitHub / Juejin / Blog / X.',
    ].join('\n'),
  }

  base.heroBanner = {
    accent: '{{years}}+ years in product & engineering | {{position}}',
    tagline: 'TypeScript · Web · Cloud Native\nArchitecture-minded, delivery-focused, quality-first.',
  }

  base.contact = {
    title: 'Public Contacts',
    description: 'Reach out via GitHub, Juejin, blog, and X',
  }

  base.photo = {
    title: 'Visual Profile',
    description: 'Generated with sonofmagic/ascii-art-avatar',
  }

  base.blogWeb = {
    title: 'Tech Homepage',
    description: 'Public technical website and long-term writings',
  }

  base.blogMp = {
    title: 'Project Index',
    description: 'Entry point for open-source projects and technical topics',
  }

  base.music = {
    title: 'Music',
    description: `Launch the ${theme.colors.primaryStrong('default')} system player`,
  }

  base.quit = {
    title: 'Sign out',
    description: 'Leave the terminal UI',
    promptMsg: 'Are you sure you want to exit?',
    successExitString: `${theme.colors.success('√')} ${theme.colors.successStrong('Exit succeeded!')}`,
  }

  base.changeLanguage = {
    title: 'Switch language',
    description: 'Chinese and English are currently available',
    selectMsg: 'Pick your preferred language',
  }

  base.wechat = {
    id: 'Public channel',
    scan: 'Scan to open',
    search: 'Search in portal',
  }

  base.page = 'page'
  base.next = 'next'
  base.prev = 'previous'
  base.exit = 'exit'

  base.directAccess = 'Direct access'
  base.openWithBrowser = 'Open in browser?'

  base.myRepositories = {
    title: 'Open-source projects',
    description: 'Highlighted: weapp-tailwindcss / weapp-vite / mokup',
    loading: {
      text: 'Fetching repositories from GitHub...',
      failText: 'Request failed - please check your network connection and retry.',
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
        failText: 'Submission failed - please try again later.',
      },
      successMsg: 'Message sent successfully!',
    },
  }

  base.about = 'About'
  base.cardMp = {
    title: 'Developer Card',
    description: 'Public developer profile',
  }

  return base
})()

export default {
  translation,
}
