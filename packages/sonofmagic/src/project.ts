import { AsciiTree } from 'oo-ascii-tree'
import { t } from './i18n'
import Dic from './resources/dic'
export function createProjectsTree() {
  const tree = new AsciiTree(t(Dic.profile.position, { interpolation: { escapeValue: false } }))

  tree.add(
    new AsciiTree(
      t(Dic.profile.job),

      new AsciiTree('React / Nextjs / Umi'),
      new AsciiTree('Vue / Nuxtjs'),
      new AsciiTree('Nestjs / Express / Koa'),
      new AsciiTree('Nodejs / Serverless'),
      new AsciiTree('Uni-app / Tarojs / Weapp')
    )
  )

  // tree.add(new AsciiTree('小程序', new AsciiTree('wepy'), new AsciiTree('uniapp')))

  // tree.add(
  //   new AsciiTree(
  //     '实时通讯IM',
  //     new AsciiTree('websocket'),
  //     new AsciiTree('socket.io'),
  //     new AsciiTree('nodejs')
  //   )
  // )

  return tree
}
