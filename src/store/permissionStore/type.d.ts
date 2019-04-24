import { PermissionStore as PermissionStoreModel } from './index'

export as namespace IPermissionStore

export interface PermissionStore extends PermissionStoreModel { }

export interface IPermission {
  id?: number
  name?: string
  level?: number
  pid?: string | number
  route?: string
  sort?: number
}
export interface IPermissionTree extends IPermission {
  children?: IPermission[]
}
export interface SearchParams {
  name?: string,
  route?: string,
}