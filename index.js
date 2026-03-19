import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createContactPanelSvg, createHeroSvg } from '@icebreakers/svg'
import fs from 'fs-extra'
import path from 'pathe'

const currentDir = fileURLToPath(new URL('.', import.meta.url))
const templatePath = path.resolve(currentDir, 'TEMPLATE.md')
const outputPath = path.resolve(currentDir, 'README.md')
const generatedAssetDir = path.resolve(currentDir, 'assets/generated')
const heroOutputPath = path.resolve(currentDir, 'assets/generated/profile-hero.svg')

const CONTACT_PANEL_WIDTH = 340
const CONTACT_PANEL_HEIGHT = 204
const contactEntries = [
  {
    title: 'Website',
    qrValue: 'https://www.icebreaker.top',
    iconHref: '../svg/chorme.svg',
    accentColor: '#7A7CFF',
    highlightColor: '#2BFFCF',
  },
  {
    title: 'Wechat',
    qrValue: 'https://u.wechat.com/EAVzgOGBnATKcePfVWr_QyQ',
    iconHref: '../svg/wechat.svg',
    note: '备注: Github',
    accentColor: '#FFD166',
    highlightColor: '#FF8A5B',
  },
]

function buildContactPanel() {
  return [
    '<p align="center">',
    `  <img width="${CONTACT_PANEL_WIDTH}" height="${CONTACT_PANEL_HEIGHT}" src="assets/generated/contact-panel.svg" alt="Contact panel" />`,
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

async function writeContactPanelSvg(entries) {
  await fs.ensureDir(generatedAssetDir)
  const panelSvg = createContactPanelSvg({
    width: CONTACT_PANEL_WIDTH,
    height: CONTACT_PANEL_HEIGHT,
    entries,
  })
  const panelOutputPath = path.resolve(generatedAssetDir, 'contact-panel.svg')
  await fs.writeFile(panelOutputPath, panelSvg)
}

async function generateReadme() {
  const template = await fs.readFile(templatePath, { encoding: 'utf-8' })
  const heroImage = await writeHeroSvg()
  await writeContactPanelSvg(contactEntries)
  const contactPanel = buildContactPanel()

  const readme = template
    .replaceAll('{{heroImage}}', heroImage)
    .replaceAll('{{table}}', contactPanel)

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
