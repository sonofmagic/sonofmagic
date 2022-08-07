// require('dotenv').config()
const fsp = require('fs').promises
const path = require('path')
const dayjs = require('dayjs')
const Font = require('ascii-art-font')
const { markdownTable } = require('./mdt');
// const ansi = require('ascii-art-ansi')

(async () => {
  const now = dayjs()
  const today = now.format('YYYY-MM-DD')
  const moment = now.format('YYYY-MM-DD HH:mm:ss')
  /**
   * @type {String} output
   */
  const [o1, o2, template] = await Promise.all([
    Font.create('UTC :', 'Doom'),
    Font.create(today, 'Doom'),
    fsp.readFile(path.resolve(__dirname, 'TEMPLATE.md'), {
      encoding: 'utf-8'
    })
  ])

  // const icebreakerSvg = await fsp.readFile('./icebreaker.svg', 'utf-8')
  // markdown 一行后面加2个空格后换行是小换行，直接换行是大换行
  // .split('\n').join('  \n')
  const matrix = template
    .replace(/{{replace}}/g, (o1 + o2).trimEnd())
    .replace(/{{date}}/g, moment)
    .replace(
      /{{table}}/g,
      markdownTable(
        [
          [
            '<a href="https://www.icebreaker.top/" target="_blank"><img src="assets/svg/chorme.svg" alt="Website Icon" /></a>',
            '<a href="https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ" target="_blank"><img src="assets/svg/wechat.svg" alt="Wechat Icon" /></a>',
            '<div style="display: flex;align-items: center;"><img width="24" style="margin-right:8px" src="assets/svg/weapp.svg" alt="Wechat Miniprogram Icon" />破冰客</div>',
            '<div style="display: flex;align-items: center;"> <img width="24" style="margin-right:8px" src="assets/svg/weapp.svg" alt="Wechat Icon" />程序员名片 </div>'
          ],
          [
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://www.icebreaker.top/" alt="My Website" />',
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ&type=circle" alt="My Wechat" />',
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~QCyvHLpi7gWkTTw_D45LNg~~&type=image" alt="My Miniprogram Blog" />',
            '<img width="160" height="160" src="https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~wCmPXG4P6LVtnyOobH53KQ~~&type=func&qrcodeType=round&posType=planet" alt="Programer Card" />'
          ]
        ],
        { align: ['c', 'c', 'c', 'c'] }
      )
    )
  // .replace(/{{icebreakerSvg}}/g, icebreakerSvg)

  // const result = ansi.map(matrix, (chr, codes, rowcol, pos, shortcircuit) => {
  //   // console.log(chr, codes, rowcol, pos, shortcircuit)
  //   const char = ansi.Codes(chr, 'yellow')
  //   return char
  // })

  await fsp.writeFile(path.resolve(__dirname, 'README.md'), matrix)
})()
