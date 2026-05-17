import type { ITranslation } from '../type'
import { getProfileExperienceYears, profileData } from '@/constants'
import { ansis, emoji, profileTheme } from '@/util'
import { translation as zhTranslation } from './zh'

const { name, nickname } = profileData
const theme = profileTheme
const experienceYears = getProfileExperienceYears()

function cloneTranslation(source: ITranslation): ITranslation {
  return JSON.parse(JSON.stringify(source)) as ITranslation
}

export const translation: ITranslation = (() => {
  const base = cloneTranslation(zhTranslation)

  base.welcome = 'I am {{nickname}}. This is my terminal profile.'
  base.promptMsg = `${theme.colors.prompt('Pick')} something to open`

  base.profile = {
    ...base.profile,
    title: 'About Me',
    description: 'I build mini-program tooling, frontend build systems, and engineering tools that can actually ship.',
    job: 'Platform engineering and full-stack architecture',
    position: 'Full-stack Architect / Technical Lead',
    summaryTitle: 'Quick intro',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${experienceYears}`,
      )}+ years on product and engineering work | ${emoji.get('sparkles')} tooling, automation, and production engineering debt`,
    ].join('\n'),
    strengthsTitle: 'What I am good at',
    strengths: [
      `${emoji.get('rocket')} I have maintained mini-program tooling long enough to know where real projects break down`,
      `${emoji.get('memo')} I turn repeated work into scripts, plugins, or release pipelines with fewer manual steps`,
      `${emoji.get('chart_with_upwards_trend')} I care about performance, reliability, and the cost of maintaining the code later`,
    ].join('\n'),
    skillsTitle: 'Tech stack',
    skills: [
      `${emoji.get('hammer')} Frontend: Nuxt / Vue component systems / performance work / React`,
      `${emoji.get('gear')} Node.js: Express / Koa / NestJS / Hono / API deployment`,
      `${emoji.get('satellite')} Serverless: Cloudflare Workers / edge functions / scheduled jobs`,
      `${emoji.get('computer')} Tooling: Tailwind transforms / Vite plugins / monorepo automation / engineering workflow cleanup`,
      `${emoji.get('chart_with_upwards_trend')} Builds and compilers: Babel / PostCSS / Webpack / Vite / Rolldown / Rspack`,
    ].join('\n'),
    expectationTitle: 'How I like to work',
    expectation: [
      `${emoji.get('handshake')} Start with the problem, then choose the implementation path`,
      `${emoji.get('hourglass')} Move fast when needed, but make the tradeoffs explicit`,
      `${emoji.get('point_right')} Prefer maintainable systems over code that only looks smart on day one`,
    ].join('\n'),
    experienceTitle: 'A few milestones',
    experience: [
      '2016 → now: publishing open-source tools around mini-program workflows and build pipelines',
      '2021 → now: maintaining weapp-tailwindcss to make Tailwind usable in WeChat mini-programs',
      '2024 → now: shipping weapp-vite to connect mini-program projects with modern build pipelines',
      '2026 → now: launching mokup, a file-based mock toolkit for Vite, CLI builds, and runtime adapters',
    ].join('\n'),
    projectsTitle: 'Tooling map',
    projects: '{{projectsTree}}',
    closingTitle: 'Topics',
    closing: [
      'Mini-program engineering, cross-platform architecture, build performance, and toolchain design are all in scope.',
      'Public channels: GitHub / Juejin / Blog / X.',
    ].join('\n'),
  }

  base.heroBanner = {
    accent: '{{years}}+ years in product and engineering work | {{position}}',
    tagline: 'TypeScript · Web · Cloud Native\nBuild tools that ship. Build systems that last.',
  }

  base.contact = {
    title: 'Contact',
    description: 'You can find me on GitHub, Juejin, my blog, and X',
  }

  base.photo = {
    title: 'Photo',
    description: 'An avatar that works in the terminal',
  }

  base.timeline = {
    title: 'Timeline',
    description: 'A year-by-year look at a few main projects',
    items: {
      openSource: {
        title: 'Started publishing open-source tools',
        detail: 'Most of them started as fixes for problems I hit in mini-program workflows and build pipelines.',
      },
      weappTailwindcss: {
        title: 'weapp-tailwindcss',
        detail: 'Made Tailwind utility classes work in WeChat mini-program projects.',
      },
      weappVite: {
        title: 'weapp-vite',
        detail: 'Connects mini-program projects with a modern build pipeline.',
      },
      mokup: {
        title: 'mokup',
        detail: 'Uses file-based routes for mocks, with Vite, CLI, and runtime adapters.',
      },
    },
  }

  base.blogWeb = {
    title: 'Homepage',
    description: 'Notes, articles, and project records',
  }

  base.blogMp = {
    title: 'Project Index',
    description: 'Open-source projects and notes in one place',
  }

  base.music = {
    title: 'Music',
    description: `Open with the ${theme.colors.primaryStrong('default')} system player`,
  }

  base.quit = {
    title: 'Exit',
    description: 'Close this terminal profile',
    promptMsg: 'Are you sure you want to exit?',
    successExitString: `${theme.colors.success('√')} ${theme.colors.successStrong('Exited')}`,
  }

  base.changeLanguage = {
    title: 'Switch language',
    description: 'Chinese / English',
    selectMsg: 'Pick a language',
  }

  base.page = 'page'
  base.next = 'next'
  base.prev = 'previous'
  base.exit = 'exit'

  base.directAccess = 'Open directly'
  base.openWithBrowser = 'Open in browser?'

  base.myRepositories = {
    title: 'Open-source projects',
    description: 'A few repos I actively maintain',
    loading: {
      text: 'Loading repositories from GitHub...',
      failText: 'Could not load GitHub data. Check the network and try again.',
      fallbackText: 'Could not reach GitHub, so here are the built-in picks.',
    },
    promptMsg: 'Pick a project',
    actions: {
      open: 'Open repository',
      details: 'Show details',
      back: 'Back to the list',
    },
    detail: {
      language: 'Language',
      stars: 'Stars',
      forks: 'Forks',
      url: 'URL',
      spotlight: 'In one line',
      bestFor: 'Useful for',
      noDescription: 'This repository has no description yet',
    },
    spotlights: {
      weappTailwindcss: {
        tagline: 'Write Tailwind in WeChat mini-program projects.',
        bestFor: 'Tailwind design systems, mini-program build setup, keeping UI code consistent across a team',
      },
      weappVite: {
        tagline: 'Connect mini-program projects with a Vite-style build pipeline.',
        bestFor: 'local feedback, plugin-based builds, gradual upgrades for older WeChat projects',
      },
      mokup: {
        tagline: 'Manage mocks with file-based routes.',
        bestFor: 'API mock routes, Vite setup, CLI and runtime adapters',
      },
    },
  }

  base.leaveMeMessage = {
    title: 'Leave me a message',
    description: 'Leave a note',
    prompt: {
      message: 'Write something here',
      choices: {
        title: 'Title',
        body: 'Content',
      },
      validate: {
        required: {
          title: 'Please add a title',
          body: 'Please write a message',
        },
      },
      loading: {
        text: 'Sending your message...',
        failText: 'Could not send it. Try again later.',
      },
      successMsg: 'Message sent.',
    },
  }

  base.about = 'About'
  return base
})()

export default {
  translation,
}
