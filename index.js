require('dotenv').config()
const fsp = require('fs').promises
const path = require('path')
const dayjs = require('dayjs')
const Font = require('ascii-art-font')

;(async () => {
  const today = dayjs().format('YYYY-MM-DD')
  /**
   * @type {String} output
   */
  const output = await Font.create(today, 'Doom')
  const template = await fsp.readFile(path.resolve(__dirname, 'FUCKME.md'), {
    encoding: 'utf-8'
  })
  // markdown 一行后面加2个空格后换行是小换行，直接换行是大换行
  // .split('\n').join('  \n')
  const result = template.replace(/{{replace}}/g, output.trimEnd())
  await fsp.writeFile(path.resolve(__dirname, 'README.md'), result)
})()
