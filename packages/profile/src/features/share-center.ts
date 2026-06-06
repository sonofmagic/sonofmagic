import type { ProfileLinkKey } from '../constants'
import { profileData, profileLinks } from '../constants'
import { Dic, t } from '../i18n'
import { consoleLog as log } from '../logger'
import { selectWithShortcuts } from '../terminal-shortcuts'
import { animateQrcodeBox, boxen, generateQrcode, openUrl, typeWriterLines } from '../util'

type ShareAction = 'qrcode' | 'open' | 'shareText' | 'back'

interface ShareChoice<TValue extends string> {
  title: string
  description?: string
  value: TValue
}

const targetKeys = Object.keys(profileLinks) as ProfileLinkKey[]

function getTargetLabel(target: ProfileLinkKey) {
  return t(Dic.shareCenter.targets[target]) as string
}

function buildTargetChoices(): Array<ShareChoice<ProfileLinkKey>> {
  return targetKeys.map(target => ({
    title: getTargetLabel(target),
    description: profileLinks[target],
    value: target,
  }))
}

function buildActionChoices(): Array<ShareChoice<ShareAction>> {
  return [
    { title: t(Dic.shareCenter.actions.open) as string, value: 'open' },
    { title: t(Dic.shareCenter.actions.qrcode) as string, value: 'qrcode' },
    { title: t(Dic.shareCenter.actions.shareText) as string, value: 'shareText' },
    { title: t(Dic.shareCenter.actions.back) as string, value: 'back' },
  ]
}

function buildShareCommand(target: ProfileLinkKey) {
  return `npx @icebreakers/profile@latest url ${target}`
}

function buildQrCommand(target: ProfileLinkKey) {
  return `npx @icebreakers/profile@latest qr ${target}`
}

function buildShareLines(target: ProfileLinkKey) {
  const url = profileLinks[target]
  const targetLabel = getTargetLabel(target)

  return [
    t(Dic.shareCenter.shareTitle, {
      nickname: profileData.nickname,
      target: targetLabel,
    }) as string,
    '',
    t(Dic.shareCenter.shareIntro, {
      name: profileData.name,
      target: targetLabel,
    }) as string,
    '',
    `${t(Dic.shareCenter.linkLabel)}: ${url}`,
    `${t(Dic.shareCenter.commandLabel)}: ${buildShareCommand(target)}`,
    `${t(Dic.shareCenter.qrCommandLabel)}: ${buildQrCommand(target)}`,
  ]
}

function renderShareText(target: ProfileLinkKey) {
  const lines = buildShareLines(target)
  return boxen(lines.join('\n'), {
    borderStyle: 'round',
    borderColor: 'cyan',
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
  })
}

async function handleTargetAction(target: ProfileLinkKey, action: ShareAction) {
  const url = profileLinks[target]

  if (action === 'qrcode') {
    const qrcode = await generateQrcode(url)
    await animateQrcodeBox(qrcode)
    return
  }

  if (action === 'open') {
    await openUrl(url)
    log(t(Dic.shareCenter.opened, {
      target: getTargetLabel(target),
      url,
    }))
    return
  }

  if (action === 'shareText') {
    const shareText = renderShareText(target)
    await typeWriterLines(shareText.split('\n'), 4, 0, 1)
  }
}

export async function showShareCenter() {
  let targetInitial = 0
  let keepPrompt = true

  while (keepPrompt) {
    const targetChoices = buildTargetChoices()
    const targetResponse = await selectWithShortcuts({
      message: () => t(Dic.shareCenter.targetPrompt) as string,
      choices: buildTargetChoices,
      initial: targetInitial,
    })

    const target = targetResponse?.value as ProfileLinkKey | undefined
    if (!target) {
      break
    }

    targetInitial = Math.max(0, targetChoices.findIndex(choice => choice.value === target))

    const actionResponse = await selectWithShortcuts({
      message: () => t(Dic.shareCenter.actionPrompt, {
        target: getTargetLabel(target),
      }) as string,
      choices: buildActionChoices,
      initial: 0,
    })

    const action = actionResponse?.value as ShareAction | undefined
    if (!action || action === 'back') {
      continue
    }

    await handleTargetAction(target, action)
    keepPrompt = false
  }
}

/** @internal */
export const shareCenterInternal = {
  buildActionChoices,
  buildQrCommand,
  buildShareCommand,
  buildShareLines,
  buildTargetChoices,
  getTargetLabel,
  renderShareText,
}
