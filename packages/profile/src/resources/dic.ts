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
    menuPrompt: '',
  },
  heroBanner: {
    accent: '',
    tagline: '',
  },
  contact: {
    title: '',
    description: '',
  },

  shareCenter: {
    title: '',
    description: '',
    targetPrompt: '',
    actionPrompt: '',
    shareTitle: '',
    shareIntro: '',
    commandLabel: '',
    linkLabel: '',
    qrCommandLabel: '',
    opened: '',
    targets: {
      github: '',
      website: '',
      repositories: '',
      juejin: '',
      blog: '',
      x: '',
    },
    actions: {
      qrcode: '',
      open: '',
      shareText: '',
      back: '',
    },
  },

  pitchLab: {
    title: '',
    description: '',
    promptMsg: '',
    copyHint: '',
    audiences: {
      oss: {
        title: '',
        description: '',
        body: '',
      },
      hiring: {
        title: '',
        description: '',
        body: '',
      },
      collaboration: {
        title: '',
        description: '',
        body: '',
      },
    },
  },

  arcade: {
    title: '',
    description: '',
    score: '',
    gameOver: '',
    games: {
      game2048: {
        title: '',
        description: '',
        controls: '',
        moves: '',
        bestTile: '',
        bestScore: '',
        keepGoing: '',
        noMove: '',
        noMoves: '',
        noUndo: '',
        restart: '',
        rawModeUnavailable: '',
        undo: '',
        win: '',
      },
    },
  },

  photo: {
    title: '',
    description: '',
  },

  timeline: {
    title: '',
    description: '',
    items: {
      openSource: {
        title: '',
        detail: '',
      },
      weappTailwindcss: {
        title: '',
        detail: '',
      },
      weappVite: {
        title: '',
        detail: '',
      },
      mokup: {
        title: '',
        detail: '',
      },
    },
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
  page: '',
  next: '',
  prev: '',
  exit: '',
  back: '',

  directAccess: '',

  openWithBrowser: '',

  myRepositories: {
    title: '',
    description: '',
    loading: {
      text: '',
      failText: '',
      fallbackText: '',
    },
    promptMsg: '',
    actions: {
      open: '',
      details: '',
      qrcode: '',
      shareText: '',
      back: '',
    },
    detail: {
      language: '',
      stars: '',
      forks: '',
      url: '',
      spotlight: '',
      bestFor: '',
      noDescription: '',
      shareTitle: '',
      shareIntro: '',
      commandLabel: '',
    },
    spotlights: {
      weappTailwindcss: {
        tagline: '',
        bestFor: '',
      },
      weappVite: {
        tagline: '',
        bestFor: '',
      },
      mokup: {
        tagline: '',
        bestFor: '',
      },
    },
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
