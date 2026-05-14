import { Dic, t } from './i18n'
import { createProjectsTree } from './project'

export interface ProfileSection {
  title: string
  lines: string[]
}

export interface TimelineEntry {
  year: string
  title: string
  detail: string
}

const profileSectionConfigs: Array<{
  titleKey: string
  bodyKey: string
  getParams?: () => Record<string, unknown>
}> = [
  { titleKey: Dic.profile.summaryTitle, bodyKey: Dic.profile.summary },
  { titleKey: Dic.profile.strengthsTitle, bodyKey: Dic.profile.strengths },
  { titleKey: Dic.profile.skillsTitle, bodyKey: Dic.profile.skills },
  { titleKey: Dic.profile.expectationTitle, bodyKey: Dic.profile.expectation },
  { titleKey: Dic.profile.experienceTitle, bodyKey: Dic.profile.experience },
  {
    titleKey: Dic.profile.projectsTitle,
    bodyKey: Dic.profile.projects,
    getParams: () => ({
      projectsTree: createProjectsTree().toString(),
    }),
  },
  { titleKey: Dic.profile.closingTitle, bodyKey: Dic.profile.closing },
]

export function buildProfileSections(): ProfileSection[] {
  return profileSectionConfigs.map(({ titleKey, bodyKey, getParams }) => {
    const title = t(titleKey) as string
    const content = t(bodyKey, {
      ...(getParams?.() ?? {}),
      interpolation: { escapeValue: false },
    }) as string
    const lines = content
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0)

    return {
      title,
      lines,
    }
  })
}

export function buildTimelineEntries(): TimelineEntry[] {
  return [
    {
      year: '2016',
      title: t(Dic.timeline.items.openSource.title),
      detail: t(Dic.timeline.items.openSource.detail),
    },
    {
      year: '2021',
      title: t(Dic.timeline.items.weappTailwindcss.title),
      detail: t(Dic.timeline.items.weappTailwindcss.detail),
    },
    {
      year: '2024',
      title: t(Dic.timeline.items.weappVite.title),
      detail: t(Dic.timeline.items.weappVite.detail),
    },
    {
      year: '2026',
      title: t(Dic.timeline.items.mokup.title),
      detail: t(Dic.timeline.items.mokup.detail),
    },
  ]
}

export function renderProfileMarkdown() {
  const sections = buildProfileSections()
  const timelineEntries = buildTimelineEntries()

  const lines = [
    `# ${t(Dic.profile.title)}`,
    '',
    `> ${t(Dic.profile.description)}`,
    '',
  ]

  for (const section of sections) {
    lines.push(`## ${section.title}`)
    lines.push('')
    lines.push(...section.lines)
    lines.push('')
  }

  lines.push(`## ${t(Dic.timeline.title)}`)
  lines.push('')
  for (const entry of timelineEntries) {
    lines.push(`- **${entry.year}** ${entry.title}: ${entry.detail}`)
  }
  lines.push('')

  return lines.join('\n').trimEnd()
}
