require('dotenv').config()
const fsp = require('fs').promises
const path = require('path')
const dayjs = require('dayjs')
const Font = require('ascii-art-font')

;
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
    fsp.readFile(path.resolve(__dirname, 'FUCKME.md'), {
      encoding: 'utf-8'
    })
  ])
  // markdown 一行后面加2个空格后换行是小换行，直接换行是大换行
  // .split('\n').join('  \n')
  const result = template.replace(/{{replace}}/g, (o1 + o2).trimEnd()).replace(/{{date}}/g, moment)
  await fsp.writeFile(path.resolve(__dirname, 'README.md'), result)
})()