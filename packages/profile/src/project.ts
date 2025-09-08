import { AsciiTree } from 'oo-ascii-tree'
import { t } from './i18n'
import Dic from './resources/dic'

export function createProjectsTree() {
  const tree = new AsciiTree(t(Dic.profile.position, { interpolation: { escapeValue: false } }))

  tree.add(
    new AsciiTree(
      t(Dic.profile.job),

      new AsciiTree('Vite / Webpack'),
      new AsciiTree('Babel / Postcss / HtmlParser / Eslint / Stylelint'),
      new AsciiTree('Vue / Nuxtjs'),
      new AsciiTree('React / Nextjs'),
      new AsciiTree('Hono / Nestjs / Express / Koa'),
      new AsciiTree('Nodejs / Serverless'),
      new AsciiTree('Uni-app / Tarojs / Weapp'),
    ),
  )

  return tree
}
