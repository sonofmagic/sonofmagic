let openModulePromise: Promise<typeof import('open')> | null = null

export async function openUrl(url: string) {
  if (!openModulePromise) {
    openModulePromise = import('open')
  }

  const mod = await openModulePromise
  await mod.default(url)
}
