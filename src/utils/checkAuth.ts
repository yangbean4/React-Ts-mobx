import { LOCALSTORAGE_KEYS } from '@constants/index'

let target
const checkName = (name) => {
  if (!target) {
    const tarString = localStorage.getItem(LOCALSTORAGE_KEYS.AUTHTARGET)
    const tt = JSON.parse(tarString) || {};
    target = tt;
  }
  return !name || target[name]
}


export const checkAuth = (name: string, component: React.ReactNode): React.ReactNode => {

  const hasAdd = (name || '').includes('&')
  const or = (name || '').includes('|')
  if (name && (hasAdd || or)) {
    const names = hasAdd ? name.split('&') : name.split('|')
    const check = hasAdd ? names.every(ele => checkName(ele)) : names.some(ele => checkName(ele))
    return check ? component : null
  } else {
    return checkName(name) ? component : null
  }
}

export const clearAuth = () => {
  target = undefined;
}