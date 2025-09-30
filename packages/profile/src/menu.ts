import { showPhotoGallery } from './features/photo-gallery'
import { showRepositoryPrompt } from './features/repositories'
import { Dic, i18next, t } from './i18n'
import { createProjectsTree } from './project'
import { ansis, boxen, generateQrcode, prompts, typeWriterLines } from './util'

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

function createProfileItem(context: MenuContext): MenuItem {
  const { icebreaker, options } = context
  return {
    value: options.profile,
    title: t(Dic.profile.title),
    description: t(Dic.profile.description, { nickname: icebreaker }),
    async handler() {
      const content = t(Dic.profile.content, {
        projectsTree: createProjectsTree().toString(),
        interpolation: { escapeValue: false },
      })

      const rows = boxen(content, {
        borderStyle: 'round',
        padding: 1,
        margin: 1,
      }).split('\n')

      await typeWriterLines(rows, 0, 0)
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
      const rows = [
        headingLine(t(Dic.contact.title)),
        '\nGithub: sonofmagic',
        `\n${t(Dic.wechat.id)}:`,
      ]
      await typeWriterLines(rows)
      logQrcode(qrcode)
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
      const rows = [
        headingLine(t(Dic.blogWeb.title)),
        `\n${t(Dic.directAccess)}: ${ansis.greenBright.underline(webSiteUrl)}`,
        `\n${t(Dic.wechat.scan)}:\n${renderQrcodeBox(qrcode)}`,
      ]
      console.log(rows.join(''))
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
      const rows = [
        headingLine(t(Dic.blogMp.title)),
        `\n${t(Dic.wechat.search)}: ${ansis.bold.greenBright('破冰客')}`,
        `\n${t(Dic.wechat.scan)}:\n${renderQrcodeBox(qrcode)}`,
      ]
      console.log(rows.join(''))
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
      const rows = [
        headingLine(t(Dic.cardMp.title)),
        `\n${t(Dic.wechat.search)}: ${ansis.bold.greenBright('程序员名片')}`,
        `\n${t(Dic.wechat.scan)}:\n${renderQrcodeBox(qrcode)}`,
        `\nMy Card Short Link: ${ansis.bold.greenBright('#小程序://程序员名片/CJpMeOanmyzNyBJ')}`,
      ]
      console.log(rows.join(''))
    },
  }
}

function createChangeLanguageItem(context: MenuContext): MenuItem {
  return {
    value: context.options.changeLanguage,
    title: t(Dic.changeLanguage.title),
    description: t(Dic.changeLanguage.description),
    async handler() {
      const choices = [
        {
          title: 'English',
          value: 'en',
        },
        {
          title: '中文',
          value: 'zh',
        },
      ]
      const response = await prompts({
        type: 'select',
        name: 'lang',
        message: t(Dic.changeLanguage.selectMsg),
        choices,
        initial: choices.findIndex(choice => i18next.language.startsWith(choice.value)),
      })
      if (response?.lang) {
        await i18next.changeLanguage(response.lang)
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
      console.log(t(Dic.quit.successExitString))
      return false
    },
  }
}

function headingLine(title: string) {
  return `\n\n${ansis.bold.greenBright('|')} ${title}`
}

function renderQrcodeBox(qrcode: string) {
  return boxen(qrcode, {
    borderStyle: 'round',
    padding: 1,
    margin: 1,
  })
}

function logQrcode(qrcode: string) {
  console.log(`\n${renderQrcodeBox(qrcode)}`)
}
