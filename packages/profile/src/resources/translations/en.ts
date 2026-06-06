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
  base.promptHint = 'arrow keys / Enter / L language / Q or Esc back'

  base.profile = {
    ...base.profile,
    title: 'About Me',
    description: 'I like open source, especially when an internal shortcut turns out to be useful for someone else too.',
    job: 'Platform engineering and full-stack architecture',
    position: 'Full-stack Architect / Technical Lead',
    summaryTitle: 'Quick intro',
    summary: [
      `${ansis.bold(name)} · ${theme.colors.primaryStrong(nickname)}`,
      `${emoji.get('handbag')} ${theme.colors.primaryStrong(
        `${experienceYears}`,
      )}+ years in product and engineering | ${emoji.get('sparkles')} open source, full-stack work, tooling, and automation`,
    ].join('\n'),
    strengthsTitle: 'What I am good at',
    strengths: [
      `${emoji.get('rocket')} I can move between product goals and code details without losing the thread`,
      `${emoji.get('memo')} When the same project problem keeps showing up, I tend to turn it into a tool, plugin, or release script`,
      `${emoji.get('chart_with_upwards_trend')} I think about performance and reliability, but also about the next person who has to change the code`,
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
      `${emoji.get('point_right')} Code still has to make sense six months later`,
    ].join('\n'),
    experienceTitle: 'A few milestones',
    experience: [
      '2016 → now: building products and systems, then open-sourcing the bits that are useful outside one project',
      '2021 → now: maintaining weapp-tailwindcss to deal with styling, build adaptation, and team conventions',
      '2024 → now: shipping weapp-vite so older projects can get faster feedback and a plugin-based build flow',
      '2026 → now: launching mokup, a file-based mock toolkit that cuts down repetitive configuration',
    ].join('\n'),
    projectsTitle: 'Tooling map',
    projects: '{{projectsTree}}',
    closingTitle: 'Topics',
    closing: [
      'A good conversation can start from open-source maintenance, full-stack architecture, build performance, automation, or the small tools a team uses every day.',
      'Public channels: GitHub / Juejin / Blog / X.',
    ].join('\n'),
    menuPrompt: 'Which profile section do you want to open?',
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
    description: 'Ways to reach me and my work',
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

  base.arcade = {
    title: 'Games',
    description: '2048 now, more terminal games later',
    menuPrompt: 'Pick a game',
    score: 'Score',
    gameOver: 'Game over. Final score: {{score}}',
    games: {
      game2048: {
        title: '2048',
        description: 'Move tiles and merge bigger numbers',
        controls: 'WASD / arrow keys to move · U undo · R restart · Q quit',
        moves: 'Moves',
        bestTile: 'Best',
        bestScore: 'High',
        keepGoing: '2048 reached. Keep going for a higher score.',
        noMove: 'No tile can move that way.',
        noMoves: 'No moves left.',
        noUndo: 'There is no previous move to undo.',
        restart: 'New board started.',
        rawModeUnavailable: 'This terminal does not support real-time key input. 2048 needs an interactive TTY.',
        undo: 'Undid one move.',
        win: '2048 reached. Keep playing for a higher score.',
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
        detail: 'Most of them started as fixes for problems I hit in product work, engineering collaboration, and build pipelines.',
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
    shortcutHint: 'L language {{language}} -> {{nextLanguage}}',
  }

  base.page = 'page'
  base.next = 'next'
  base.prev = 'previous'
  base.exit = 'exit'
  base.back = 'Back'

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
