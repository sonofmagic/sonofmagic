import type { ProfileOptions } from './constants'
import type { ProfileSection, TimelineEntry } from './profile-content'
import { showArcade } from './features/arcade'
import { showPhotoGallery } from './features/photo-gallery'
import { showRepositoryPrompt } from './features/repositories'
import { showShareCenter } from './features/share-center'
import { Dic, t } from './i18n'
import { consoleLog as log } from './logger'
import { buildProfileSections, buildTimelineEntries } from './profile-content'
import { selectWithShortcuts } from './terminal-shortcuts'
import { boxen, profileTheme, sleep, typeWriterLines } from './util'

export interface MenuContext {
  icebreaker: string
  options: ProfileOptions
  isUnicodeSupported: boolean
}

export type MenuHandlerResult = boolean | void
export type MenuHandler = () => Promise<MenuHandlerResult>

export interface MenuItem {
  value: string
  title: string
  description?: string
  handler: MenuHandler
}

type ProfileHubAction = 'overview' | 'timeline' | 'photo' | 'back'
type GameHubAction = 'game2048' | 'back'

interface ProfileHubChoice {
  title: string
  description?: string
  value: ProfileHubAction
}

interface GameHubChoice {
  title: string
  description?: string
  value: GameHubAction
}

function headingLine(title: string) {
  return `\n\n${profileTheme.colors.heading('|')} ${title}`
}

async function renderProfileSections(sections: ProfileSection[]) {
  const palettes = profileTheme.colors.menu.palettes
  if (!palettes.length) {
    return
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    if (!section) {
      continue
    }
    const palette = palettes[i % palettes.length]
    if (!palette) {
      continue
    }
    const header = palette.header(`✦ ${section.title}`)
    const body = section.lines.map(line => palette.body(`  ${line}`)).join('\n')

    const card = boxen(`${header}\n\n${body}`, {
      borderStyle: 'round',
      borderColor: palette.border,
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    })

    const lines = card.split('\n')
    log('')
    await typeWriterLines(lines, 4, 0, 1)
    if (i < sections.length - 1) {
      log('')
      await sleep(80)
    }
  }
}

async function renderTimeline(entries: TimelineEntry[]) {
  const lines = entries.flatMap((entry, index) => {
    const connector = index === entries.length - 1 ? '└─' : '├─'
    return [
      `${profileTheme.colors.heading(connector)} ${profileTheme.colors.primaryStrong(entry.year)} ${entry.title}`,
      `   ${profileTheme.colors.secondary(entry.detail)}`,
    ]
  })

  await typeWriterLines([
    headingLine(t(Dic.timeline.title)),
    '',
    ...lines,
  ], 8, 70, 2)
}

function buildProfileHubChoices(): ProfileHubChoice[] {
  return [
    {
      title: t(Dic.profile.summaryTitle),
      description: t(Dic.profile.description),
      value: 'overview',
    },
    {
      title: t(Dic.timeline.title),
      description: t(Dic.timeline.description),
      value: 'timeline',
    },
    {
      title: t(Dic.photo.title),
      description: t(Dic.photo.description),
      value: 'photo',
    },
    {
      title: t(Dic.back),
      value: 'back',
    },
  ]
}

function buildGameHubChoices(): GameHubChoice[] {
  return [
    {
      title: t(Dic.arcade.games.game2048.title),
      description: t(Dic.arcade.games.game2048.description),
      value: 'game2048',
    },
    {
      title: t(Dic.back),
      value: 'back',
    },
  ]
}

function createProfileItem(context: MenuContext): MenuItem {
  const { icebreaker, options } = context
  return {
    value: options.profile,
    title: t(Dic.profile.title),
    description: t(Dic.profile.description, { nickname: icebreaker }),
    async handler() {
      const response = await selectWithShortcuts({
        message: () => t(Dic.profile.menuPrompt) as string,
        choices: buildProfileHubChoices,
        initial: 0,
      })

      const action = response?.value as ProfileHubAction | undefined

      if (!action || action === 'back') {
        return
      }

      if (action === 'timeline') {
        await renderTimeline(buildTimelineEntries())
        return
      }

      if (action === 'photo') {
        await showPhotoGallery()
        return
      }

      await renderProfileSections(buildProfileSections())
    },
  }
}

function createShareCenterItem(context: MenuContext): MenuItem {
  return {
    value: context.options.shareCenter,
    title: t(Dic.shareCenter.title),
    description: t(Dic.shareCenter.description),
    async handler() {
      await showShareCenter()
    },
  }
}

function createGamesItem(context: MenuContext): MenuItem {
  return {
    value: context.options.arcade,
    title: t(Dic.arcade.title),
    description: t(Dic.arcade.description),
    async handler() {
      const response = await selectWithShortcuts({
        message: () => t(Dic.arcade.menuPrompt) as string,
        choices: buildGameHubChoices,
        initial: 0,
      })

      const game = response?.value as GameHubAction | undefined
      if (!game || game === 'back') {
        return
      }

      await showArcade()
    },
  }
}

function createRepositoriesItem(context: MenuContext): MenuItem {
  return {
    value: context.options.myRepositories,
    title: t(Dic.myRepositories.title),
    description: t(Dic.myRepositories.description),
    async handler() {
      await showRepositoryPrompt({
        isUnicodeSupported: context.isUnicodeSupported,
      })
    },
  }
}

function createQuitItem(context: MenuContext): MenuItem {
  return {
    value: context.options.quit,
    title: t(Dic.quit.title),
    description: t(Dic.quit.description),
    async handler() {
      log(t(Dic.quit.successExitString))
      return false
    },
  }
}

export function buildMenuItems(context: MenuContext): MenuItem[] {
  return [
    createProfileItem(context),
    createRepositoriesItem(context),
    createShareCenterItem(context),
    createGamesItem(context),
    createQuitItem(context),
  ]
}

/** @internal */
export const menuInternal = {
  buildGameHubChoices,
  buildProfileHubChoices,
  buildProfileSections,
}
