import { RoleStore as RoleStoreModel } from './index'
import { string } from 'prop-types';

export as namespace IRoleStore

export interface RoleStore extends RoleStoreModel { }

export interface IRole {
  id?: number
  role_name?: string
  remarks?: string
  user_count?: number
  user_detail?: string[]
  utime?: string
  permission?: string
}
export interface SearchParams {
  role_name?: string,
}
export interface RoleOption {
  id?: string | number
  role_name?: string
}