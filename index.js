import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createHeroSvg, createQrCodeSvg } from '@icebreakers/svg'
import fs from 'fs-extra'
import { markdownTable } from 'markdown-table'
import path from 'pathe'

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const templatePath = path.resolve(currentDir, 'TEMPLATE.md')
const outputPath = path.resolve(currentDir, 'README.md')
const generatedAssetDir = path.resolve(currentDir, 'assets/generated')
const heroOutputPath = path.resolve(currentDir, 'assets/generated/profile-hero.svg')

const QR_IMAGE_SIZE = 160
const contactEntries = [
  {
    href: 'https://www.icebreaker.top/',
    iconSrc: 'assets/svg/chorme.svg',
    iconAlt: 'Website Icon',
    qrValue: 'https://www.icebreaker.top',
    qrFileName: 'contact-website-qr.svg',
    qrAlt: 'My Website',
  },
  {
    href: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    iconSrc: 'assets/svg/wechat.svg',
    iconAlt: 'Wechat Icon',
    iconNote: '备注: Github',
    qrValue: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    qrFileName: 'contact-wechat-qr.svg',
    qrAlt: 'My Wechat',
  },
]

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

async function writeHeroSvg() {
  const heroSvg = createHeroSvg({
    title: 'ice breaker',
    subtitle: 'Build systems, mini-program workflows, and profile-grade interfaces.',
    badge: {
      text: 'Github Profile Hero',
      color: '#FFD166',
    },
  })
  await fs.ensureDir(path.dirname(heroOutputPath))
  await fs.writeFile(heroOutputPath, heroSvg)
  return '<a href="https://icebreaker.top/" target="_blank"><img src="assets/generated/profile-hero.svg" alt="Icebreaker Github Profile Hero" /></a>'
}

async function writeContactQrSvgs(entries) {
  await fs.ensureDir(generatedAssetDir)

  return Promise.all(entries.map(async (entry, index) => {
    const qrSvg = createQrCodeSvg(entry.qrValue, {
      size: QR_IMAGE_SIZE,
      accentColor: index === 0 ? '#7A7CFF' : '#FFD166',
      highlightColor: index === 0 ? '#2BFFCF' : '#FF8A5B',
    })
    const qrOutputPath = path.resolve(generatedAssetDir, entry.qrFileName)
    await fs.writeFile(qrOutputPath, qrSvg)

    return {
      ...entry,
      qrSrc: `assets/generated/${entry.qrFileName}`,
    }
  }))
}

async function generateReadme() {
  const template = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const heroImage = await writeHeroSvg()
  const contactEntriesWithQr = await writeContactQrSvgs(contactEntries)
  const contactTable = buildContactTable(contactEntriesWithQr)

  const readme = template
    .replaceAll('{{heroImage}}', heroImage)
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
