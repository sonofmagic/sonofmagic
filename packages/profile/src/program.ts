import type { MenuContext, MenuItem } from './menu'
import process from 'node:process'
import { optionsData, profileData } from './constants'
import { Dic, init, t } from './i18n'
import { buildMenuItems } from './menu'
import { isUnicodeSupported as detectUnicodeSupport } from './support'
import { ansis, prompts } from './util'

const isUnicodeSupported = detectUnicodeSupport()
const log = console.log

export async function main() {
  try {
    await init()

    const { nickname } = profileData
    const icebreaker = ansis.greenBright(nickname)
    const context: MenuContext = {
      icebreaker,
      options: optionsData,
      isUnicodeSupported,
    }

    log(t(Dic.welcome, { nickname: icebreaker }))

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

      initial = Math.max(0, selectedIndex)
      const shouldContinue = await menuItems[selectedIndex].handler()
      if (shouldContinue === false) {
        continueLoop = false
      }
    }
  }
  catch (error) {
    console.error(error)
  }
}

function mapMenuItems(menuItems: MenuItem[]) {
  return menuItems.map(item => ({
    title: item.title,
    description: item.description,
    value: item.value,
  }))
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
