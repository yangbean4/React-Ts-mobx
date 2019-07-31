import { GlobalStore as GlobalStoreModel } from './index'

export as namespace IGlobalStore

export interface GlobalStore extends GlobalStoreModel { }

export type SideBarTheme = 'dark' | 'light'

export interface menu {
  title?: string
  path?: string
  onClick?: Function
}