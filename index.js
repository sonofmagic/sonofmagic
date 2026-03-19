import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createContactCardSvg, createHeroSvg } from '@icebreakers/svg'
import fs from 'fs-extra'
import path from 'pathe'

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const templatePath = path.resolve(currentDir, 'TEMPLATE.md')
const outputPath = path.resolve(currentDir, 'README.md')
const generatedAssetDir = path.resolve(currentDir, 'assets/generated')
const heroOutputPath = path.resolve(currentDir, 'assets/generated/profile-hero.svg')

const CONTACT_CARD_WIDTH = 320
const CONTACT_CARD_HEIGHT = 236
const contactEntries = [
  {
    href: 'https://www.icebreaker.top/',
    title: 'Website',
    qrValue: 'https://www.icebreaker.top',
    iconHref: '../svg/chorme.svg',
    cardFileName: 'contact-website-card.svg',
    imageAlt: 'Website contact card',
    accentColor: '#7A7CFF',
    highlightColor: '#2BFFCF',
  },
  {
    href: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    title: 'Wechat',
    qrValue: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    iconHref: '../svg/wechat.svg',
    note: '备注: Github',
    cardFileName: 'contact-wechat-card.svg',
    imageAlt: 'Wechat contact card',
    accentColor: '#FFD166',
    highlightColor: '#FF8A5B',
  },
]

function buildContactCards(entries) {
  const cardImages = entries.map(entry =>
    `<a href="${entry.href}" target="_blank"><img width="${CONTACT_CARD_WIDTH}" height="${CONTACT_CARD_HEIGHT}" src="${entry.cardSrc}" alt="${entry.imageAlt}" /></a>`,
  )

  return [
    '<p align="center">',
    `  ${cardImages.join('\n  ')}`,
    '</p>',
  ].join('\n')
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

async function writeContactCardSvgs(entries) {
  await fs.ensureDir(generatedAssetDir)

  return Promise.all(entries.map(async (entry, index) => {
    const cardSvg = createContactCardSvg({
      title: entry.title,
      label: entry.label,
      qrValue: entry.qrValue,
      iconHref: entry.iconHref,
      note: entry.note,
      badge: '',
      accentColor: entry.accentColor,
      highlightColor: entry.highlightColor,
    })
    const cardOutputPath = path.resolve(generatedAssetDir, entry.cardFileName)
    await fs.writeFile(cardOutputPath, cardSvg)

    return {
      ...entry,
      cardSrc: `assets/generated/${entry.cardFileName}`,
    }
  }))
}

async function generateReadme() {
  const template = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const heroImage = await writeHeroSvg()
  const contactEntriesWithCards = await writeContactCardSvgs(contactEntries)
  const contactCards = buildContactCards(contactEntriesWithCards)

  const readme = template
    .replaceAll('{{heroImage}}', heroImage)
    .replaceAll('{{table}}', contactCards)

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
