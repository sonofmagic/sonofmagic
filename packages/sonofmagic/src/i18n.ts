import i18next from 'i18next'
import resources from './resources'
import Dic from './resources/dic'
import osLocale from 'os-locale'
export async function init() {
  const locale = await osLocale()
  const lng = locale.startsWith('zh') ? 'zh' : 'en'
  return await i18next.init({
    lng,
    returnNull: false,
    // debug: true,
    resources
  })
}

export const t = i18next.t
// type tParameters = Parameters<typeof i18next.t>

// export function t(
//   key: tParameters[0],
//   options?: tParameters[1],
// ) {
//   if (options === undefined) {
//     return i18next.t(key)
//   }
//   return i18next.t(key, options)

// }

export { i18next, Dic }
