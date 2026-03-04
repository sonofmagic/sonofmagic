import path from 'node:path'
import dayjs from 'dayjs'

const startWorkDay = '2016-07-01'
export const profileData: {
  whenToStartWork: ReturnType<typeof dayjs>
  name: string
  nickname: string
  gender: string
  startWorkDay: string
} = {
  whenToStartWork: dayjs(startWorkDay),
  name: 'Icebreaker Lab',
  nickname: 'icebreaker',
  gender: 'private',
  startWorkDay,
}

export const optionsData = {
  profile: 'profile',
  contact: 'contact',
  // wechat: 'wechat',
  blogWeb: 'blogWeb',
  blogMp: 'blogMp',
  cardMp: 'cardMp',
  leaveMsg: 'leaveMsg',
  about: 'about',
  music: 'music',
  quit: 'quit',
  photo: 'photo',
  changeLanguage: 'changeLanguage',
  myRepositories: 'myRepositories',
} as const

export type ProfileOptions = typeof optionsData

export const profileLinks = {
  github: 'https://github.com/sonofmagic',
  website: 'https://icebreaker.top',
  repositories: 'https://github.com/sonofmagic?tab=repositories',
  juejin: 'https://juejin.cn/user/1943592290496919',
  blog: 'http://blog.icebreaker.top/',
  x: 'https://x.com/sonofmagic95',
} as const

export type ProfileLinkKey = keyof typeof profileLinks

export const assetPaths = {
  photosDir: path.resolve(__dirname, '../assets/photos'),
} as const
