import type { Dayjs } from 'dayjs'
import path from 'node:path'
import dayjs from 'dayjs'

const startWorkDay = '2016-07-01'
export const profileData: {
  whenToStartWork: Dayjs
  name: string
  nickname: string
  gender: string
  startWorkDay: string
} = {
  whenToStartWork: dayjs(startWorkDay),
  name: '杨启明',
  nickname: 'ice breaker',
  gender: '男',
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

export const assetPaths = {
  photosDir: path.resolve(__dirname, '../assets/photos'),
} as const
