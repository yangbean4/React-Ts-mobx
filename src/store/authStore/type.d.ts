import { AuthStore as AuthStoreModel } from './index'

export as namespace IAuthStore

export interface AuthStore extends AuthStoreModel { }

export interface LoginParams {
    user_name: string
    pwd: string
    captcha: string
}

export interface UserInfo {
    user_name: string
    id: string | number
    menu: []
    token: string
}

export interface Sidebar {
    id?: string | number,
    primary_name?: string
    config?: TemplateConfig
}