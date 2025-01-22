import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import createPlayer from 'play-sound'
import { axios, chalk } from './util'

const player = createPlayer()
async function playMusicByUrl(url: string, name?: string) {
  try {
    const basename = path.basename(url)

    const targetPath = path.resolve(process.cwd(), basename)

    const audio = await axios.get(url, {
      responseType: 'stream',
      headers: {
        referer: 'https://www.icebreaker.top/',
      },
    })
    const ws = fs.createWriteStream(targetPath)
    audio.data.pipe(ws)
    ws.on('finish', () => {
      console.log(`${chalk.green('√')} ${chalk.bold(`${name || '音乐'}加载完成`)}`)
      player.play(targetPath)
      // sound.play(targetPath)
    })
  }
  catch (error) {
    console.log('出错啦，没有获取到音乐资源。')
  }
}

export { playMusicByUrl }
