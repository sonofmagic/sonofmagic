// export default {
//   name: '杨启明',
//   nickname: 'ice breaker',
//   gender: '男',
//   startWorkDay: '2016-07-01',
//   songs: [
//     {
//       title: 'MagicWaltz',
//       description: 'The Legend of 1900',
//       value: 'MagicWaltz',
//       url: 'https://static.icebreaker.top/audio/MagicWaltz.m4a'
//     }
//   ],
//   options: {
//     profile: 'profile',
//     contact: 'contact',
//     // wechat: 'wechat',
//     blogWeb: 'blogWeb',
//     blogMp: 'blogMp',
//     music: 'music',
//     quit: 'quit',
//     photo: 'photo',
//     changeLanguage: 'changeLanguage'
//   }
// }
import dayjs, { type Dayjs } from 'dayjs'
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
  startWorkDay
}

export const songsData = [
  {
    title: 'MagicWaltz',
    description: 'The Legend of 1900',
    value: 'MagicWaltz',
    url: 'https://static.icebreaker.top/audio/MagicWaltz.m4a'
  }
]

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
  myRepositories: 'myRepositories'
}
