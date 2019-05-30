import { LOCALSTORAGE_KEYS } from '@constants/index'

let target
const checkName = (name) => {
  if (!target) {
    const tarString = localStorage.getItem(LOCALSTORAGE_KEYS.AUTHTARGET)
    const tt = JSON.parse(tarString) || {}
    target = Object.keys(tt).filter(key => tt[key])
  }
  return !name || target.find(ele => ele.indexOf(name) === 0)
}

export const checkAuth = (name: string, component?: React.ReactNode): React.ReactNode | boolean => {
  const hasAdd = (name || '').includes('&')
  const or = (name || '').includes('|')
  if (name && (hasAdd || or)) {
    const names = hasAdd ? name.split('&') : name.split('|')
    const check = hasAdd ? names.every(ele => checkName(ele)) : names.some(ele => checkName(ele))
    return check ? component || true : null
  } else {
    return checkName(name) ? component || true : null
  }
}

export const clearAuth = () => {
  target = undefined
}