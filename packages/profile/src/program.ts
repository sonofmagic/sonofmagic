import type { MenuContext, MenuItem } from './menu'
import process from 'node:process'
import { optionsData, profileData } from './constants'
import { Dic, init, t } from './i18n'
import { consoleError as errorLog, consoleLog as log } from './logger'
import { buildMenuItems } from './menu'
import { isUnicodeSupported as detectUnicodeSupport } from './support'
import { dayjs, displayHeroBanner, profileTheme, prompts } from './util'

const isUnicodeSupported = detectUnicodeSupport()

function mapMenuItems(menuItems: MenuItem[]) {
  return menuItems.map(item => ({
    title: item.title,
    description: item.description,
    value: item.value,
  }))
}

async function handleMenuSelection(value: string, context: MenuContext) {
  const menuItems = buildMenuItems(context)
  const target = menuItems.find(item => item.value === value)
  if (!target) {
    return true
  }

  const result = await target.handler()

  if (value === context.options.changeLanguage) {
    const { nickname, whenToStartWork, name } = profileData
    const experienceYears = Math.max(0, dayjs().diff(whenToStartWork, 'year'))
    const accent = t(Dic.heroBanner.accent, {
      years: experienceYears,
      position: t(Dic.profile.position),
    }) as string

    const taglineText = t(Dic.heroBanner.tagline) as string
    const taglineLines = taglineText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    await displayHeroBanner({
      title: nickname.toUpperCase(),
      subtitle: t(Dic.welcome, { nickname: name }) as string,
      accent,
      tagline: taglineLines,
      taglineColor: null,
    })
  }

  if (result === false) {
    return false
  }

  return true
}

async function confirmExit() {
  const { value } = await prompts({
    type: 'toggle',
    name: 'value',
    message: t(Dic.quit.promptMsg),
    active: 'yes',
    inactive: 'no',
    initial: false,
  })
  return Boolean(value)
}

export async function main() {
  try {
    await init()

    const { nickname, whenToStartWork, name } = profileData
    const experienceYears = Math.max(0, dayjs().diff(whenToStartWork, 'year'))
    const icebreaker = profileTheme.colors.primary(nickname)
    const context: MenuContext = {
      icebreaker,
      options: optionsData,
      isUnicodeSupported,
    }

    const accent = t(Dic.heroBanner.accent, {
      years: experienceYears,
      position: t(Dic.profile.position),
    }) as string

    const taglineText = t(Dic.heroBanner.tagline) as string
    const taglineLines = taglineText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    await displayHeroBanner({
      title: nickname.toUpperCase(),
      subtitle: t(Dic.welcome, { nickname: name }) as string,
      accent,
      tagline: taglineLines,
      taglineColor: null,
    })

    let continueLoop = true
    let initial = 0

    while (continueLoop) {
      const menuItems = buildMenuItems(context)
      const { value } = await prompts(
        {
          type: 'select',
          name: 'value',
          message: t(Dic.promptMsg) as string,
          choices: mapMenuItems(menuItems),
          initial,
        },
        {
          async onCancel() {
            if (await confirmExit()) {
              log(t(Dic.quit.successExitString))
              process.exit()
            }
            return true
          },
        },
      )

      const selectedIndex = menuItems.findIndex(item => item.value === value)
      if (selectedIndex === -1) {
        continue
      }

      const selectedItem = menuItems[selectedIndex]
      if (!selectedItem) {
        continue
      }

      initial = Math.max(0, selectedIndex)
      const shouldContinue = await handleMenuSelection(selectedItem.value, context)
      if (shouldContinue === false) {
        continueLoop = false
      }
    }
  }
  catch (error) {
    errorLog(error)
  }
}
