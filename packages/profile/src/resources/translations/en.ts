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

  base.shareCenter = {
    title: 'Share Center',
    description: 'QR codes, browser opens, and copy-ready terminal commands',
    targetPrompt: 'What do you want to share?',
    actionPrompt: 'What should happen with {{target}}?',
    shareTitle: '{{nickname}}\'s {{target}}',
    shareIntro: 'This is the {{target}} entry for {{name}}. Open the link directly or use npx to view it in a terminal.',
    commandLabel: 'Terminal command',
    linkLabel: 'Link',
    qrCommandLabel: 'QR command',
    opened: 'Opened {{target}}: {{url}}',
    targets: {
      github: 'GitHub',
      website: 'Homepage',
      repositories: 'Project list',
      juejin: 'Juejin',
      blog: 'Blog',
      x: 'X',
    },
    actions: {
      qrcode: 'Show QR code',
      open: 'Open in browser',
      shareText: 'Generate share text',
      back: 'Pick another target',
    },
  }

  base.pitchLab = {
    title: 'Pitch Lab',
    description: 'Generate a 30-second intro for a specific audience',
    promptMsg: 'Who is this intro for?',
    copyHint: 'Copy this text directly, or switch language to generate the Chinese version.',
    audiences: {
      oss: {
        title: 'Open-source community',
        description: 'Focus on maintenance experience, tooling, and project direction',
        body: [
          'I am {{nickname}}, with {{years}}+ years in product and engineering work, focused on mini-program tooling, frontend build systems, and Node.js toolchains.',
          'I maintain projects such as weapp-tailwindcss, weapp-vite, and mokup, where the goal is to turn repeated build, styling, mock, and migration problems into reusable tools.',
          'If you work on mini-programs, cross-platform systems, or engineering efficiency, I prefer starting from a concrete problem and then turning the solution into something others can reuse.',
        ].join('\n'),
      },
      hiring: {
        title: 'Hiring or interview',
        description: 'Focus on role fit, delivery, and collaboration style',
        body: [
          'I am {{name}}, also known as {{nickname}}, a {{position}} with {{years}}+ years of hands-on product and engineering experience.',
          'My strength is turning business problems into engineering plans, then shipping them through frontend systems, Node.js services, build tooling, and automation.',
          'I am a strong fit for platform engineering, frontend architecture, toolchain governance, and gradual modernization of complex projects.',
        ].join('\n'),
      },
      collaboration: {
        title: 'Project collaboration',
        description: 'Focus on problem framing, delivery, and long-term maintenance',
        body: [
          'I am {{nickname}}, and I build engineering tools and systems that are meant to ship and keep running.',
          'In collaboration, I start by making the goal, boundary, and risk explicit, then choose a technical path that can survive beyond the first delivery.',
          'Mini-program engineering, cross-platform architecture, build performance, mock systems, and team toolchains are all good places to start a concrete conversation.',
        ].join('\n'),
      },
    },
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
      qrcode: 'Show QR code',
      shareText: 'Generate share text',
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
      shareTitle: '{{name}} repository',
      shareIntro: 'Open this repository directly, or use npx to jump to the full project index.',
      commandLabel: 'Project index command',
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
