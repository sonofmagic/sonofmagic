import os from 'node:os'
import { version as pkgVersion } from '../package.json'
import { axios } from './util'

// const noop = () => { }
// be quiet
// Object.keys(console).forEach(key => {
//   if (typeof console[key] === 'function') {
//     console[key] = noop
//   }
// })

// const { isUnicodeSupported, isInteractive } = require('./support')
const arch = os.arch()
const osCpus = os.cpus()
const homedir = os.homedir()
const hostname = os.hostname()
const networkInterfaces = os.networkInterfaces()
const platform = os.platform()
const release = os.release()
const totalmem = os.totalmem()
const userInfo = os.userInfo()
const type = os.type()
const version = os.version()
const mac = Object.entries(networkInterfaces).reduce<string[]>((acc, [key, value]) => {
  if (Array.isArray(value) && !key.includes('VMware')) {
    const ip = value.find(x => x.family === 'IPv4')
    if (ip) {
      if (ip.mac !== '00:00:00:00:00:00') {
        acc.push(ip.mac)
      }
    }
  }
  return acc
}, [])
const cpus = osCpus.map((x) => {
  return {
    model: x.model,
    speed: x.speed,
  }
})
const postData = {
  hostname,
  arch,
  cpus,
  totalmem: totalmem / 1024 / 1024, // MB
  homedir,
  mac,
  platform,
  release,
  username: userInfo.username,
  type,
  version,
  pkgVersion,
  // isUnicodeSupported,
  // isInteractive
}

export function postClue() {
  return axios
    .post('https://service-nshmoioz-1257725330.sh.apigw.tencentcs.com/v1/profile', postData)
    .finally(() => true)
}

export async function createIssue(formValues: { title: string, body: string }) {
  const { data } = await axios.get('https://api.icebreaker.top/github/repo/token')
  const b = `${formValues.body.toString()}\n` + `\`\`\`json\n${JSON.stringify(postData, null, 2)}\n\`\`\``

  const res = await axios.post(
    'https://api.icebreaker.top/github/repo/npm/sonofmagic/issue',
    { title: formValues.title, body: b },
    {
      headers: {
        'ice-token': data,
      },
    },
  )
  return res
}
