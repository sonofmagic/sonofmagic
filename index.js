import process from 'node:process'
import { fileURLToPath } from 'node:url'
import Font from 'ascii-art-font'
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
    iconNote: '备注: Github',
    qrSrc:
      'https://github-readme-svg.vercel.app/api/v1/svg/qrcode?value=https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ&type=circle&posColor=%23000',
    qrAlt: 'My Wechat',
  },
]

const QR_IMAGE_SIZE = 160

const centerAlign = columns => Array.from({ length: columns }).fill('c')

function buildContactTable(entries) {
  return markdownTable(
    [
      entries.map(
        (entry) => {
          const iconLink
            = `<a href="${entry.href}" target="_blank"><img src="${entry.iconSrc}" alt="${entry.iconAlt}" width="18" height="18" align="absmiddle" /></a>`
          if (!entry.iconNote) {
            return iconLink
          }
          return `${iconLink}&nbsp;${entry.iconNote}`
        },
      ),
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
    Font.create(now, 'Doom'),
  ])

  return `${utcLabel}${utcDate}`.trimEnd()
}

function getUtcDateString() {
  return new Date().toISOString().slice(0, 10)
}

async function generateReadme() {
  const utcDate = getUtcDateString()
  const template = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const asciiClock = await buildAsciiClock(utcDate)

  const contactTable = buildContactTable(contactEntries)
  const generatedAt = utcDate

  const readme = template
    .replaceAll('{{replace}}', asciiClock)
    .replaceAll('{{date}}', generatedAt)
    .replaceAll('{{table}}', contactTable)

  const existed = await fs.pathExists(outputPath)
  const prevReadme = existed ? await fs.readFile(outputPath, { encoding: 'utf-8' }) : ''
  if (prevReadme !== readme) {
    await fs.writeFile(outputPath, readme)
  }
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
