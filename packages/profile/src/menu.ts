import type { ProfileOptions } from './constants'
import type { SupportedLanguage } from './i18n'
import type { ProfileSection, TimelineEntry } from './profile-content'
import { profileLinks } from './constants'
import { showPhotoGallery } from './features/photo-gallery'
import { showRepositoryPrompt } from './features/repositories'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, t } from './i18n'
import { consoleLog as log } from './logger'
import { buildProfileSections, buildTimelineEntries } from './profile-content'
import { animateQrcodeBox, boxen, generateQrcode, profileTheme, prompts, sleep, typeWriterLines } from './util'

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

function createProfileItem(context: MenuContext): MenuItem {
  const { icebreaker, options } = context
  return {
    value: options.profile,
    title: t(Dic.profile.title),
    description: t(Dic.profile.description, { nickname: icebreaker }),
    async handler() {
      const sections = buildProfileSections()
      await renderProfileSections(sections)
    },
  }
}

function createContactItem(context: MenuContext): MenuItem {
  const { icebreaker, options } = context
  return {
    value: options.contact,
    title: t(Dic.contact.title),
    description: t(Dic.contact.description, { nickname: icebreaker }),
    async handler() {
      const qrcode = await generateQrcode(profileLinks.github)
      const lines = [
        headingLine(t(Dic.contact.title)),
        '',
        `GitHub: ${profileTheme.colors.link(profileLinks.github)}`,
        `Juejin: ${profileTheme.colors.link(profileLinks.juejin)}`,
        `Blog: ${profileTheme.colors.link(profileLinks.blog)}`,
        `X: ${profileTheme.colors.link(profileLinks.x)}`,
        '',
        `${t(Dic.blogWeb.title)}: ${profileTheme.colors.link(profileLinks.website)}`,
      ]
      await typeWriterLines(lines, 12, 90, 4)
      await animateQrcodeBox(qrcode)
    },
  }
}

function createPhotoItem(context: MenuContext): MenuItem {
  return {
    value: context.options.photo,
    title: t(Dic.photo.title),
    description: t(Dic.photo.description),
    async handler() {
      await showPhotoGallery()
    },
  }
}

function createTimelineItem(context: MenuContext): MenuItem {
  return {
    value: context.options.timeline,
    title: t(Dic.timeline.title),
    description: t(Dic.timeline.description),
    async handler() {
      await renderTimeline(buildTimelineEntries())
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

function createBlogWebItem(context: MenuContext): MenuItem {
  return {
    value: context.options.blogWeb,
    title: t(Dic.blogWeb.title),
    description: t(Dic.blogWeb.description),
    async handler() {
      const qrcode = await generateQrcode(profileLinks.website)
      const lines = [
        headingLine(t(Dic.blogWeb.title)),
        '',
        `${t(Dic.directAccess)}: ${profileTheme.colors.link(profileLinks.website)}`,
        '',
        'Scan to open in browser:',
      ]
      await typeWriterLines(lines, 12, 90, 4)
      await animateQrcodeBox(qrcode)
    },
  }
}

function createBlogMpItem(context: MenuContext): MenuItem {
  return {
    value: context.options.blogMp,
    title: t(Dic.blogMp.title),
    description: t(Dic.blogMp.description),
    async handler() {
      const qrcode = await generateQrcode(profileLinks.repositories)
      const lines = [
        headingLine(t(Dic.blogMp.title)),
        '',
        `${t(Dic.directAccess)}: ${profileTheme.colors.link(profileLinks.repositories)}`,
        '',
        'Scan to open repository list:',
      ]
      await typeWriterLines(lines, 12, 90, 4)
      await animateQrcodeBox(qrcode)
    },
  }
}

function createChangeLanguageItem(context: MenuContext): MenuItem {
  return {
    value: context.options.changeLanguage,
    title: t(Dic.changeLanguage.title),
    description: t(Dic.changeLanguage.description),
    async handler() {
      const languages = getSupportedLanguages()
      const labelMap: Record<SupportedLanguage, string> = {
        en: 'English',
        zh: '中文',
      }
      const choices = languages.map(language => ({
        title: labelMap[language],
        value: language,
      }))

      const currentLanguage = getCurrentLanguage()
      const initialIndex = Math.max(
        0,
        choices.findIndex(choice => currentLanguage.startsWith(choice.value)),
      )

      const response = await prompts({
        type: 'select',
        name: 'lang',
        message: t(Dic.changeLanguage.selectMsg),
        choices,
        initial: initialIndex,
      })
      const selectedLanguage = response?.lang as SupportedLanguage | undefined
      if (selectedLanguage) {
        await changeLanguage(selectedLanguage)
      }
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
    createContactItem(context),
    createPhotoItem(context),
    createTimelineItem(context),
    createRepositoriesItem(context),
    createBlogWebItem(context),
    createBlogMpItem(context),
    createChangeLanguageItem(context),
    createQuitItem(context),
  ]
}

/** @internal */
export const menuInternal = {
  buildProfileSections,
}
