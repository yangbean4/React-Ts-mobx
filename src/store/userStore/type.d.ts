import { UserStore as UserStoreModel } from './index'

export as namespace IUserStore

export interface UserStore extends UserStoreModel { }

export interface IUser {
    id?: number
    owner?: string
    role?: string
    status?: 0 | 1
    user_name?: string
    pwd?: string
}
export interface SearchParams {
    user_name?: string,
    owner?: string,
    status?: string | number
}