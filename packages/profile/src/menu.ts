import type { SupportedLanguage } from './i18n'
import { showPhotoGallery } from './features/photo-gallery'
import { showRepositoryPrompt } from './features/repositories'
import { changeLanguage, Dic, getCurrentLanguage, getSupportedLanguages, t } from './i18n'
import { consoleLog as log } from './logger'
import { createProjectsTree } from './project'
import { animateQrcodeBox, boxen, generateQrcode, profileTheme, prompts, sleep, typeWriterLines } from './util'

export interface MenuContext {
  icebreaker: string
  options: Record<string, string>
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

interface ProfileSection {
  title: string
  lines: string[]
}

function headingLine(title: string) {
  return `\n\n${profileTheme.colors.heading('|')} ${title}`
}

function buildProfileSections(): ProfileSection[] {
  const sectionConfigs: Array<{ titleKey: string, bodyKey: string, params?: Record<string, unknown> }> = [
    { titleKey: Dic.profile.summaryTitle, bodyKey: Dic.profile.summary },
    { titleKey: Dic.profile.strengthsTitle, bodyKey: Dic.profile.strengths },
    { titleKey: Dic.profile.skillsTitle, bodyKey: Dic.profile.skills },
    { titleKey: Dic.profile.expectationTitle, bodyKey: Dic.profile.expectation },
    { titleKey: Dic.profile.experienceTitle, bodyKey: Dic.profile.experience },
    {
      titleKey: Dic.profile.projectsTitle,
      bodyKey: Dic.profile.projects,
      params: {
        projectsTree: createProjectsTree().toString(),
      },
    },
    { titleKey: Dic.profile.closingTitle, bodyKey: Dic.profile.closing },
  ]

  return sectionConfigs.map(({ titleKey, bodyKey, params }) => {
    const title = t(titleKey) as string
    const content = t(bodyKey, {
      ...(params ?? {}),
      interpolation: { escapeValue: false },
    }) as string
    const lines = content
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)

    return {
      title,
      lines,
    }
  })
}

async function renderProfileSections(sections: ProfileSection[]) {
  const palettes = profileTheme.colors.menu.palettes

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const palette = palettes[i % palettes.length]
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
      const qrcode = await generateQrcode('https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ')
      const lines = [
        headingLine(t(Dic.contact.title)),
        '',
        'Github: sonofmagic',
        '',
        `${t(Dic.wechat.id)}:`,
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
      const webSiteUrl = 'https://icebreaker.top'
      const qrcode = await generateQrcode(webSiteUrl)
      const lines = [
        headingLine(t(Dic.blogWeb.title)),
        '',
        `${t(Dic.directAccess)}: ${profileTheme.colors.link(webSiteUrl)}`,
        '',
        `${t(Dic.wechat.scan)}:`,
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
      const qrcode = await generateQrcode('https://mp.weixin.qq.com/a/~QCyvHLpi7gWkTTw_D45LNg~~')
      const lines = [
        headingLine(t(Dic.blogMp.title)),
        '',
        `${t(Dic.wechat.search)}: ${profileTheme.colors.primaryStrong('破冰客')}`,
        '',
        `${t(Dic.wechat.scan)}:`,
      ]
      await typeWriterLines(lines, 12, 90, 4)
      await animateQrcodeBox(qrcode)
    },
  }
}

function createCardMpItem(context: MenuContext): MenuItem {
  return {
    value: context.options.cardMp,
    title: t(Dic.cardMp.title),
    description: t(Dic.cardMp.description),
    async handler() {
      const qrcode = await generateQrcode('https://mp.weixin.qq.com/a/~wCmPXG4P6LVtnyOobH53KQ~~')
      const lines = [
        headingLine(t(Dic.cardMp.title)),
        '',
        `${t(Dic.wechat.search)}: ${profileTheme.colors.primaryStrong('程序员名片')}`,
        '',
        `${t(Dic.wechat.scan)}:`,
      ]
      await typeWriterLines(lines, 12, 90, 4)
      await animateQrcodeBox(qrcode)
      log(`\nMy Card Short Link: ${profileTheme.colors.primaryStrong('#小程序://程序员名片/CJpMeOanmyzNyBJ')}`)
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
    createRepositoriesItem(context),
    createBlogWebItem(context),
    createBlogMpItem(context),
    createCardMpItem(context),
    createChangeLanguageItem(context),
    createQuitItem(context),
  ]
}

/** @internal */
export const menuInternal = {
  buildProfileSections,
}
