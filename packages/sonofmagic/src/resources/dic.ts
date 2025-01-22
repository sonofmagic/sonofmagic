// key is the value not the key
import set from 'lodash/set'
import { isComplexType } from '@/util'

function combine(k: string, p?: string) {
  return p ? p + '.' + k : k
}

function setObjPath(dic: Record<string, unknown>, res: Record<string, unknown>, p?: string) {
  const keys = Reflect.ownKeys(dic).filter((x) => {
    return typeof x === 'string'
  }) as string[]
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]

    if (isComplexType(dic[k])) {
      setObjPath(dic[k] as Record<string, unknown>, res, combine(k, p))
    } else {
      set(res, combine(k, p), combine(k, p))
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
    job: ''
  },
  contact: {
    title: '',
    description: ''
  },

  photo: {
    title: '',
    description: ''
  },

  cardMp: {
    title: '',
    description: ''
  },

  blogWeb: {
    title: '',
    description: ''
  },

  blogMp: {
    title: '',
    description: ''
  },

  music: {
    title: '',
    description: ''
  },

  quit: {
    title: '',
    description: '',
    promptMsg: '',
    successExitString: ''
  },

  changeLanguage: { title: '', description: '', selectMsg: '' },
  wechat: {
    id: '',
    search: '',
    scan: ''
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
      failText: ''
    },
    promptMsg: ''
  },

  leaveMeMessage: {
    title: '',
    description: '',
    prompt: {
      message: '',
      choices: {
        title: '',
        body: ''
      },
      validate: {
        required: {
          title: '',
          body: ''
        }
      },
      successMsg: '',
      loading: {
        text: '',
        failText: ''
      }
    }
  },
  about: 'about'
}

function setDic(dic: typeof Dic) {
  const res = {}
  setObjPath(dic, res)
  return res
}

export type IDictionary = typeof Dic

export default <IDictionary>setDic(Dic)
