import process from 'node:process'
import { fileURLToPath } from 'node:url'
import Font from 'ascii-art-font'
import dayjs from 'dayjs'
import fs from 'fs-extra'
import { markdownTable } from 'markdown-table'
import path from 'pathe'

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const templatePath = path.resolve(currentDir, 'TEMPLATE.md')
const outputPath = path.resolve(currentDir, 'README.md')

const contactEntries = [
  {
    href: 'https://www.icebreaker.top/',
    iconSrc: 'assets/svg/chorme.svg',
    iconAlt: 'Website Icon',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://www.icebreaker.top&type=func&qrcodeType=round&posType=planet&posColor=%23000',
    qrAlt: 'My Website',
  },
  {
    href: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    iconSrc: 'assets/svg/wechat.svg',
    iconAlt: 'Wechat Icon',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ&type=circle&posColor=%23000',
    qrAlt: 'My Wechat',
  },
]

const miniPrograms = [
  {
    name: '破冰客',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~QCyvHLpi7gWkTTw_D45LNg~~&type=image&posColor=%23000',
    qrAlt: '破冰客小程序',
  },
  {
    name: '程序员名片',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~wCmPXG4P6LVtnyOobH53KQ~~&type=image&posColor=%23000',
    qrAlt: '程序员名片小程序',
  },
  {
    name: 'IceStack',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~Z3ufw44yiwSSRapyxRmuqQ~~&type=image&posColor=%23000',
    qrAlt: 'IceStack 小程序',
  },
  {
    name: 'tailwindcss',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://mp.weixin.qq.com/a/~Z3ufw44yiwSSRapyxRmuqQ~~&type=image&posColor=%23000',
    qrAlt: 'tailwindcss 主题小程序',
  },
]

const QR_IMAGE_SIZE = 160

const centerAlign = columns => Array.from({ length: columns }, () => 'c')

function buildContactTable(entries) {
  return markdownTable(
    [
      entries.map(
        entry =>
          `<a href="${entry.href}" target="_blank"><img src="${entry.iconSrc}" alt="${entry.iconAlt}" /></a>`,
      ),
      entries.map(
        entry =>
          `<img width="${QR_IMAGE_SIZE}" height="${QR_IMAGE_SIZE}" src="${entry.qrSrc}" alt="${entry.qrAlt}" />`,
      ),
    ],
    { align: centerAlign(entries.length) },
  )
}

function buildMiniProgramTable(entries) {
  return markdownTable(
    [
      entries.map(entry => `<div style="display: flex;align-items: center;"> ${entry.name} </div>`),
      entries.map(
        entry =>
          `<img width="${QR_IMAGE_SIZE}" height="${QR_IMAGE_SIZE}" src="${entry.qrSrc}" alt="${entry.qrAlt}" />`,
      ),
    ],
    { align: centerAlign(entries.length) },
  )
}

async function buildAsciiClock(now) {
  const [utcLabel, utcDate] = await Promise.all([
    Font.create('UTC :', 'Doom'),
    Font.create(now.format('YYYY-MM-DD'), 'Doom'),
  ])

  return `${utcLabel}${utcDate}`.trimEnd()
}

async function generateReadme() {
  const now = dayjs()
  const template = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const asciiClock = await buildAsciiClock(now)

  const contactTable = buildContactTable(contactEntries)
  const miniProgramTable = buildMiniProgramTable(miniPrograms)
  const generatedAt = now.format('YYYY-MM-DD HH:mm:ss')

  const readme = template
    .replaceAll('{{replace}}', asciiClock)
    .replaceAll('{{date}}', generatedAt)
    .replaceAll('{{table}}', contactTable)
    .replaceAll('{{mpTable}}', miniProgramTable)

  await fs.writeFile(outputPath, readme)
}

async function main() {
  try {
    await generateReadme()
  }
  catch (error) {
    console.error('Failed to generate README:', error)
    process.exitCode = 1
  }
}

void main()
