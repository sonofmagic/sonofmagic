import type { ITranslation } from '../type'
import { profileData } from '@/constants'
import { ansis, dayjs, emoji } from '@/util'

const { gender, name, nickname, whenToStartWork } = profileData

export const translation: ITranslation = {
  welcome: 'Welcome to the {{nickname}} information management system',
  promptMsg: `${ansis.greenBright('Please select')} one of the following information entries to query`,
  profile: {
    content: [
      `${ansis.bold(name)} ${ansis.greenBright(nickname)} ${ansis.bold.blueBright(gender)}`,
      `\n\n${emoji.get('handbag')} ${ansis.bold.greenBright(
        dayjs().year() - whenToStartWork.year(),
      )} years of experience | ${emoji.get('mortar_board')} Yangzhou University - Software Engineering - Bachelor`,
      `\n\n${ansis.bold.greenBright('|')} Personal Strengths`,
      '\nAlways reliable. Love technology',
      `\n\n${ansis.bold.greenBright('|')} Personal Skills`,
      '\nGood basic skills',
      `\n\n${ansis.bold.greenBright('|')} Desired Position`,
      `\n${emoji.get('art')} More money | ${emoji.get('moneybag')} Less work | ${emoji.get(
        'point_right',
      )} Close to home ${emoji.get('laughing')}${emoji.get('joy')}`,
      `\n\n${ansis.bold.greenBright('|')} Work Experience`,
      '\nI\'ve been a worker, squeezed to the point of no return \nI\'ve risked my life as a partner for a bad check', // ,最终被踢出局
      `\n\n${ansis.bold.greenBright('|')} Project Experience`,
      `\n{{projectsTree}}`,
      '\n> "人生代代无穷已，江月年年只相似"',
      '\n Welcome partners who are interested in technology to communicate with each other！',
    ].join(''),
    description: `Display personal information of {{nickname}}`,
    title: 'Personal information',
    job: 'As a Full-Stack Developer',
    position: 'Entrepreneur / Core Developer',
  },
  contact: {
    title: 'Contact information',
    description: `Methods to get in touch with {{nickname}}`,
  },
  photo: {
    title: 'My Photo',
    description: 'generated by sonofmagic/ascii-art-avatar',
  },
  blogWeb: {
    title: 'Blog - Web',
    description: 'https://www.icebreaker.top/',
  },
  blogMp: {
    title: 'Blog - WeChat applet',
    description: 'search "破冰客" in Wechat app',
  },
  music: {
    title: 'Music',
    description: `Call ${ansis.bold.greenBright('default')} system player`,
  },
  quit: {
    title: 'Sign out',
    description: 'Exit the system',
    promptMsg: 'Are you sure you want to exit this system?',
    successExitString: `${ansis.green('√')} ${ansis.greenBright.bold('Exit succeeded!')}`,
  },
  changeLanguage: {
    title: 'Switch language',
    description: 'Currently, Chinese and English are supported',
    selectMsg: 'Choose your language',
  },
  wechat: {
    id: 'Wechat id',
    scan: 'Open WeChat and scan',
    search: 'WeChat search',
  },

  page: 'page',
  next: 'next',
  prev: 'prev',
  exit: 'exit',

  directAccess: 'Direct Access',

  openWithBrowser: 'Open directly in browser?',
  myRepositories: {
    title: 'My Open Source Repos',
    description: 'Fetch data from Github',
    loading: {
      failText: 'Fetching data from Github failed, please retry.',
      text: 'Fetching Repos from Github...',
    },
    promptMsg: 'Repos List',
  },
  leaveMeMessage: {
    title: 'Leave me a message',
    description: 'Write some words',
    prompt: {
      message: 'Please fill in the form below',
      choices: {
        body: 'content',
        title: 'title',
      },
      loading: {
        text: 'Posting data to my serverless function...',
        failText: 'The submission failed, probably because I didn\'t pay Aliyun money',
      },
      validate: {
        required: {
          body: 'Please fill in the content!',
          title: 'Please fill in the title!',
        },
      },
      successMsg: 'Leave a message successfully!',
    },
  },
  about: 'about',
  cardMp: {
    description: 'github card in weapp',
    title: 'My Github Card',
  },
}

export default {
  translation,
}
