import { getProfileExperienceYears, profileData } from '../constants'
import { Dic, t } from '../i18n'
import { boxen, profileTheme, prompts, typeWriterLines } from '../util'

type PitchAudience = 'oss' | 'hiring' | 'collaboration'

interface PitchChoice {
  title: string
  description: string
  value: PitchAudience
}

const audiences: PitchAudience[] = ['oss', 'hiring', 'collaboration']

function getAudienceKeys(audience: PitchAudience) {
  return Dic.pitchLab.audiences[audience]
}

function buildPitchChoices(): PitchChoice[] {
  return audiences.map(audience => ({
    title: t(getAudienceKeys(audience).title) as string,
    description: t(getAudienceKeys(audience).description) as string,
    value: audience,
  }))
}

function buildPitchLines(audience: PitchAudience) {
  const years = getProfileExperienceYears()
  const body = t(getAudienceKeys(audience).body, {
    name: profileData.name,
    nickname: profileData.nickname,
    years,
    position: t(Dic.profile.position),
  }) as string

  return body
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function renderPitchCard(audience: PitchAudience) {
  const keys = getAudienceKeys(audience)
  const title = profileTheme.colors.primaryStrong(t(keys.title) as string)
  const lines = buildPitchLines(audience)
  const hint = profileTheme.colors.secondary(t(Dic.pitchLab.copyHint) as string)

  return boxen([title, '', ...lines, '', hint].join('\n'), {
    borderStyle: 'round',
    borderColor: 'yellow',
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
  })
}

export async function showPitchLab() {
  const response = await prompts({
    type: 'select',
    name: 'audience',
    message: t(Dic.pitchLab.promptMsg),
    choices: buildPitchChoices(),
    initial: 0,
  })

  const audience = response?.audience as PitchAudience | undefined
  if (!audience) {
    return
  }

  const card = renderPitchCard(audience)
  await typeWriterLines(card.split('\n'), 4, 0, 1)
}

/** @internal */
export const pitchLabInternal = {
  buildPitchChoices,
  buildPitchLines,
  renderPitchCard,
}
