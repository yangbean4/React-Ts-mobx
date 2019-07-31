import { AccountStore as AccountStoreModel } from './index'

export as namespace IAccountStore

export interface AccountStore extends AccountStoreModel { }

export interface IAccount {
    id?: number
    role?: string
    status?: 0 | 1
    user_name?: string
    password?: string
    company?: number
    role_id?: number
    account_type?: number
    company_id?: number
}
export interface SearchParams {
    company_name?: string,
    status?: (0 | 1)[]
}