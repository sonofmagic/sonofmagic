import type { MenuContext, MenuItem } from './menu'
import process from 'node:process'
import { getProfileExperienceYears, optionsData, profileData } from './constants'
import { Dic, init, t } from './i18n'
import { consoleError as errorLog, consoleLog as log } from './logger'
import { buildMenuItems } from './menu'
import { isUnicodeSupported as detectUnicodeSupport } from './support'
import { selectWithShortcuts } from './terminal-shortcuts'
import { displayHeroBanner, profileTheme, prompts } from './util'

const isUnicodeSupported = detectUnicodeSupport()

function mapMenuItems(menuItems: MenuItem[]) {
  return menuItems.map(item => ({
    title: item.title,
    value: item.value,
    ...(item.description ? { description: item.description } : {}),
  }))
}

async function selectMainMenuItem(context: MenuContext, initial: number): Promise<{ value: string, index: number } | null> {
  const selection = await selectWithShortcuts({
    message: () => t(Dic.promptMsg) as string,
    choices: () => mapMenuItems(buildMenuItems(context)),
    initial,
  })
  if (!selection) {
    return null
  }

  return {
    value: selection.value,
    index: selection.index,
  }
}

async function renderCurrentHeroBanner() {
  const { nickname, name } = profileData
  const experienceYears = getProfileExperienceYears()
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

async function handleMenuSelection(value: string, context: MenuContext) {
  const menuItems = buildMenuItems(context)
  const target = menuItems.find(item => item.value === value)
  if (!target) {
    return true
  }

  const result = await target.handler()

  if (value === context.options.changeLanguage) {
    await renderCurrentHeroBanner()
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

export interface MainOptions {
  language?: string
}

export async function main(options?: MainOptions) {
  try {
    await init(options?.language)

    const icebreaker = profileTheme.colors.primary(profileData.nickname)
    const context: MenuContext = {
      icebreaker,
      options: optionsData,
      isUnicodeSupported,
    }

    await renderCurrentHeroBanner()

    let continueLoop = true
    let initial = 0

    while (continueLoop) {
      const menuItems = buildMenuItems(context)
      const selection = await selectMainMenuItem(context, initial)

      if (!selection) {
        if (await confirmExit()) {
          log(t(Dic.quit.successExitString))
          process.exit()
        }
        continue
      }

      const selectedIndex = selection.index
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
