import i18next from 'i18next'
import { osLocale } from 'os-locale'
import resources from './resources'
import Dic from './resources/dic'

export async function init() {
  const locale = await osLocale()
  const lng = locale.startsWith('zh') ? 'zh' : 'en'
  return await i18next.init({
    lng,
    returnNull: false,
    // debug: true,
    resources,
  })
}

export const t = i18next.t

export { Dic, i18next }
