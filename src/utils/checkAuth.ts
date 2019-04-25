import { LOCALSTORAGE_KEYS } from '@constants/index'

export const checkAuth = (name: string, component: React.ReactNode): React.ReactNode => {
  const tarString = localStorage.getItem(LOCALSTORAGE_KEYS.AUTHTARGET)
  const target = JSON.parse(tarString)
  if (name && name.includes('&')) {
    const names = name.split('&')
    const check = names.every(ele => target[ele])
    return check ? component : null
  } else {
    return name === undefined || target[name] ? component : null
  }
}