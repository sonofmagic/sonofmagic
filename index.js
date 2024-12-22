// require('dotenv').config()
import fsp from 'node:fs/promises'
import path from 'node:path'
import Font from 'ascii-art-font'
import dayjs from 'dayjs'
import { markdownTable } from 'markdown-table'

// const ansi = require('ascii-art-ansi')

;

(async () => {
  const now = dayjs()
  const today = now.format('YYYY-MM-DD')
  const moment = now.format('YYYY-MM-DD HH:mm:ss')
  /**
   * @type {string} output
   */
  const [o1, o2, template] = await Promise.all([
    Font.create('UTC :', 'Doom'),
    Font.create(today, 'Doom'),
    fsp.readFile(path.resolve(import.meta.dirname, 'TEMPLATE.md'), {
      encoding: 'utf-8',
    }),
  ])

  // const icebreakerSvg = await fsp.readFile('./icebreaker.svg', 'utf-8')
  // markdown 一行后面加2个空格后换行是小换行，直接换行是大换行
  // .split('\n').join('  \n')
  const matrix = template
    .replace(/\{\{replace\}\}/g, (o1 + o2).trimEnd())
    .replace(/\{\{date\}\}/g, moment)
    .replace(
      /\{\{table\}\}/g,
      markdownTable(
        [
          [
            '<a href="https://www.icebreaker.top/" target="_blank"><img src="assets/svg/chorme.svg" alt="Website Icon" /></a>',
            '<a href="https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ" target="_blank"><img src="assets/svg/wechat.svg" alt="Wechat Icon" /></a>',

          ],
          [
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://www.icebreaker.top&type=func&qrcodeType=round&posType=planet&posColor=%23000" alt="My Website" />',
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ&type=circle&posColor=%23000" alt="My Wechat" />',

          ],
        ],
        { align: ['c', 'c', 'c', 'c'] },
      ),
    )
    .replace(/\{\{mpTable\}\}/g, markdownTable(
      [
        [

          '<div style="display: flex;align-items: center;"> 破冰客 </div>',
          '<div style="display: flex;align-items: center;"> 程序员名片 </div>',
          '<div style="display: flex;align-items: center;"> IceStack </div>',
          '<div style="display: flex;align-items: center;"> tailwindcss </div>',
        ],
        [

          '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~QCyvHLpi7gWkTTw_D45LNg~~&type=image&posColor=%23000" alt="My Miniprogram Blog" />',
          '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~wCmPXG4P6LVtnyOobH53KQ~~&type=image&posColor=%23000" alt="Programer Card" />',
          '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~Z3ufw44yiwSSRapyxRmuqQ~~&type=image&posColor=%23000" alt="@icestack/ui" />',
          '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~Z3ufw44yiwSSRapyxRmuqQ~~&type=image&posColor=%23000" alt="@icestack/ui" />',
        ],
      ],
      { align: ['c', 'c', 'c', 'c'] },
    ))
  // .replace(/{{icebreakerSvg}}/g, icebreakerSvg)

  // const result = ansi.map(matrix, (chr, codes, rowcol, pos, shortcircuit) => {
  //   // console.log(chr, codes, rowcol, pos, shortcircuit)
  //   const char = ansi.Codes(chr, 'yellow')
  //   return char
  // })

  await fsp.writeFile(path.resolve(import.meta.dirname, 'README.md'), matrix)
})()
