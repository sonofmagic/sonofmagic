import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import readline from 'node:readline'
import ora from 'ora'
import { optionsData, profileData } from './constants'
import { Dic, i18next, init, t } from './i18n'
import { createProjectsTree } from './project'
import { getRepoList } from './repos'
import { isUnicodeSupported as _isUnicodeSupported } from './support'
import { ansis, boxen, emoji, generateQrcode, prompts, sleep, splitParagraphByLines, typeWriterLines } from './util'

const isUnicodeSupported = _isUnicodeSupported()
const log = console.log

const { nickname } = profileData
const options = optionsData

const icebreaker = ansis.greenBright(nickname)
// https://stackoverflow.com/questions/23548946/how-can-i-check-if-a-users-computer-supports-emoji

export async function main() {
  try {
    await init()

    log(t(Dic.welcome, { nickname: icebreaker }))
    let ptr = 1
    let initial = 0

    while (ptr) {
      const choices = [
        {
          title: t(Dic.profile.title),
          value: options.profile,
          description: t(Dic.profile.description, { nickname: icebreaker }),
          async handler() {
            const rows = boxen(
              t(Dic.profile.content, {
                projectsTree: createProjectsTree().toString(),
                interpolation: { escapeValue: false },
              }),
              {
                borderStyle: 'round',
                padding: 1,
                margin: 1,
              },
            ).split('\n')
            // log(rows)
            await typeWriterLines(rows, 0, 0)
          },
        },
        {
          title: t(Dic.contact.title),
          value: options.contact,
          description: t(Dic.contact.description, { nickname: icebreaker }),
          async handler() {
            const qrcode = await generateQrcode('https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ')

            const rows = [
              `\n\n${ansis.bold.greenBright('|')} ${t(Dic.contact.title)}`,
              '\nGithub: sonofmagic',
              `\n${t(Dic.wechat.id)}:`,
            ]
            await typeWriterLines(rows)
            log(`\n${boxen(qrcode, {
              borderStyle: 'round',
              padding: 1,
              margin: 1,
            })}`)
          },
        },
        {
          title: t(Dic.photo.title),
          value: options.photo,
          description: t(Dic.photo.description),
          handler: async () => {
            const total = 6
            let idx = 0
            let loading = false
            const photoCache: string[] = []
            const showPhoto = async (idx = 0) => {
              loading = true
              let photo = photoCache[idx]
              if (!photo) {
                photo = fs.readFileSync(path.resolve(__dirname, `../assets/photos/${idx}.txt`), {
                  encoding: 'utf-8',
                })
                photoCache[idx] = photo
              }

              log('\n')

              for (const rows of splitParagraphByLines(photo)) {
                log(rows)
                await sleep(100)
              }

              // log(photo)
              // await typeWriterLines(splitParagraphByLines(photo), 0, 0, 0)
              log(
                `\n${t(Dic.page)}: ${idx + 1}/${total} ${t(Dic.prev)}: ${ansis.bold.greenBright('← ↑')} ${t(
                  Dic.next,
                )}: ${ansis.bold.greenBright('→ ↓')} ${t(Dic.exit)}: ${ansis.bold.greenBright('ctrl + c')}`,
              )

              loading = false
            }
            await new Promise((resolve) => {
              showPhoto(idx)
              const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
              })
              const onKeypress = function (_str: any, key: { name: 'right' | 'left' | 'up' | 'down' }) {
              // 如果正在加载，则不响应键盘事件
                if (loading) {
                  return
                }
                if (key.name === 'right' || key.name === 'down') {
                  idx++
                  if (idx >= total) {
                    idx -= total
                  }

                  showPhoto(idx)
                }
                if (key.name === 'left' || key.name === 'up') {
                  idx--
                  if (idx < 0) {
                    idx += total
                  }
                  showPhoto(idx)
                }
              }
              process.stdin.on('keypress', onKeypress)
              rl.on('close', () => {
                process.stdin.off('keypress', onKeypress)
                resolve(true)
              })
            })
          },
        },
        {
          title: t(Dic.myRepositories.title),
          value: options.myRepositories,
          description: t(Dic.myRepositories.description),
          handler: async () => {
            const spinner = ora({
              spinner: 'soccerHeader',
              text: t(Dic.myRepositories.loading.text),
            }).start()
            try {
              const repos = await getRepoList()
              spinner.stop()
              let initial = 0
              let repoPtr = 1
              while (repoPtr) {
                await prompts(
                  {
                    type: 'autocomplete',
                    name: 'url',
                    message: t(Dic.myRepositories.promptMsg),
                    choices: repos.map((x, idx) => {
                      return {
                        title:
                        `${x.name
                        } (${isUnicodeSupported ? emoji.get('star') : 'star'}:${x.stargazers_count} ${isUnicodeSupported ? emoji.get('fork_and_knife') : 'fork'
                        }:${x.forks_count})`,
                        description: x.description,
                        value: {
                          value: x.html_url,
                          index: idx,
                        },
                      }
                    }),
                    initial,
                  },
                  {
                    async onSubmit(_prompt: any, url: { index: number, value: string }) {
                      initial = url.index
                      const mod = await import('open')
                      mod.default(url.value)
                    },
                    onCancel() {
                      repoPtr = 0
                    },
                  },
                )
              }
            }
            catch {
              console.warn(t(Dic.myRepositories.loading.failText))
            }
            finally {
              spinner.stop()
            }
          },
        },
        {
          title: t(Dic.blogWeb.title),
          value: options.blogWeb,
          description: t(Dic.blogWeb.description),
          handler: async () => {
            const webSiteUrl = 'https://icebreaker.top'
            const qrcode = await generateQrcode(webSiteUrl)
            const rows = [
              `\n\n${ansis.bold.greenBright('|')} ${t(Dic.blogWeb.title)}`,
              `\n${t(Dic.directAccess)}: ${ansis.greenBright.underline(webSiteUrl)}`,
              `\n${t(Dic.wechat.scan)}:\n${boxen(qrcode, {
                borderStyle: 'round',
                padding: 1,
                margin: 1,
              })}`,
            // ansis.greenBright.underline(webSiteUrl)
            ]
            log(rows.join(''))
          },
        },
        {
          title: t(Dic.blogMp.title),
          value: options.blogMp,
          description: t(Dic.blogMp.description),
          handler: async () => {
            const qrcode = await generateQrcode('https://mp.weixin.qq.com/a/~QCyvHLpi7gWkTTw_D45LNg~~')
            const rows = [
              `\n\n${ansis.bold.greenBright('|')} ${t(Dic.blogMp.title)}`,
              `\n${t(Dic.wechat.search)}: ${ansis.bold.greenBright('破冰客')}`,
              `\n${t(Dic.wechat.scan)}:\n${boxen(qrcode, {
                borderStyle: 'round',
                padding: 1,
                margin: 1,
              })}`,
            ]
            log(rows.join(''))
          },
        },
        {
          title: t(Dic.cardMp.title),
          value: options.cardMp,
          description: t(Dic.cardMp.description),
          handler: async () => {
            const qrcode = await generateQrcode('https://mp.weixin.qq.com/a/~wCmPXG4P6LVtnyOobH53KQ~~')
            const rows = [
              `\n\n${ansis.bold.greenBright('|')} ${t(Dic.cardMp.title)}`,
              `\n${t(Dic.wechat.search)}: ${ansis.bold.greenBright('程序员名片')}`,
              `\n${t(Dic.wechat.scan)}:\n${boxen(qrcode, {
                borderStyle: 'round',
                padding: 1,
                margin: 1,
              })}`,
              `\nMy Card Short Link: ${ansis.bold.greenBright('#小程序://程序员名片/CJpMeOanmyzNyBJ')}`,
            ]
            log(rows.join(''))
          },
        },
        {
          title: t(Dic.changeLanguage.title),
          value: options.changeLanguage,
          description: t(Dic.changeLanguage.description),
          handler: async () => {
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
              initial: choices.findIndex(x => i18next.language.startsWith(x.value)),
            })
            await i18next.changeLanguage(response.lang)
          },
        },
        {
          title: t(Dic.quit.title),
          value: options.quit,
          description: t(Dic.quit.description),
          handler: async () => {
            log(t(Dic.quit.successExitString))
            ptr = 0
          },
        },
      ]

      const { value } = await prompts(
        {
          type: 'select',
          name: 'value',
          message: t(Dic.promptMsg) as string,
          choices,
          initial,
        },
        {
          async onCancel() {
            const { value } = await prompts({
              type: 'toggle',
              name: 'value',
              message: t(Dic.quit.promptMsg),
              active: 'yes',
              inactive: 'no',
              initial: false,
            })
            if (value) {
              log(t(Dic.quit.successExitString))
              process.exit()
            }
            return true
          },
        },
      )

      const idx = choices.findIndex(x => x.value === value)
      if (choices[idx]) {
        initial = Math.max(0, idx)
        await choices[idx].handler()
      }
    }
  }
  catch (error) {
    console.error(error)
  }
}
