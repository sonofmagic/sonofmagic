import { AsciiTree } from 'oo-ascii-tree'
import { t } from './i18n'
import Dic from './resources/dic'

export function createProjectsTree() {
  const tree = new AsciiTree(t(Dic.profile.position, { interpolation: { escapeValue: false } }))

  tree.add(
    new AsciiTree(
      t(Dic.profile.job),

      new AsciiTree('Vite / Rolldown / Webpack / Rspack'),
      new AsciiTree('TypeScript / AST / Babel / PostCSS / ESLint / Stylelint'),
      new AsciiTree('Vue 3 / Nuxt 3'),
      new AsciiTree('React / Next.js'),
      new AsciiTree('Hono / NestJS / BFF / Serverless APIs'),
      new AsciiTree('Edge Runtime / Cloudflare Workers / Deno Deploy'),
      new AsciiTree('Turborepo / Monorepo Engineering / CI Automation'),
      new AsciiTree('Mini Programs: Uni-app / Taro / Weapp'),
    ),
  )

  return tree
}
