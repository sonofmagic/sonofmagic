import { set } from 'es-toolkit/compat'
import { isComplexType } from '@/util'

function combine(k: string, p?: string) {
  return p ? `${p}.${k}` : k
}

function setObjPath(dic: Record<string, unknown>, res: Record<string, unknown>, p?: string) {
  const keys = Reflect.ownKeys(dic).filter((x) => {
    return typeof x === 'string'
  }) as string[]
  for (const key of keys) {
    const value = dic[key]

    if (isComplexType(value)) {
      setObjPath(value as Record<string, unknown>, res, combine(key, p))
    }
    else {
      set(res, combine(key, p), combine(key, p))
    }
  }
}

const Dic = {
  welcome: '',
  promptMsg: '',

  profile: {
    title: '',
    description: '',
    content: '',
    position: '',
    job: '',
    summaryTitle: '',
    summary: '',
    strengthsTitle: '',
    strengths: '',
    skillsTitle: '',
    skills: '',
    expectationTitle: '',
    expectation: '',
    experienceTitle: '',
    experience: '',
    projectsTitle: '',
    projects: '',
    closingTitle: '',
    closing: '',
  },
  heroBanner: {
    accent: '',
    tagline: '',
  },
  contact: {
    title: '',
    description: '',
  },

  photo: {
    title: '',
    description: '',
  },

  cardMp: {
    title: '',
    description: '',
  },

  blogWeb: {
    title: '',
    description: '',
  },

  blogMp: {
    title: '',
    description: '',
  },

  music: {
    title: '',
    description: '',
  },

  quit: {
    title: '',
    description: '',
    promptMsg: '',
    successExitString: '',
  },

  changeLanguage: { title: '', description: '', selectMsg: '' },
  wechat: {
    id: '',
    search: '',
    scan: '',
  },

  page: '',
  next: '',
  prev: '',
  exit: '',

  directAccess: '',

  openWithBrowser: '',

  myRepositories: {
    title: '',
    description: '',
    loading: {
      text: '',
      failText: '',
    },
    promptMsg: '',
  },

  leaveMeMessage: {
    title: '',
    description: '',
    prompt: {
      message: '',
      choices: {
        title: '',
        body: '',
      },
      validate: {
        required: {
          title: '',
          body: '',
        },
      },
      successMsg: '',
      loading: {
        text: '',
        failText: '',
      },
    },
  },
  about: 'about',
}

function setDic(dic: typeof Dic) {
  const res = {}
  setObjPath(dic, res)
  return res
}

export type IDictionary = typeof Dic

export default <IDictionary>setDic(Dic)
