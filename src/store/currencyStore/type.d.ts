import { CurrencyStore as CurrencyStoreModel } from './index'

export as namespace ICurrencyStore

export interface CurrencyStore extends CurrencyStoreModel { }

export interface ICurrency {
    pkg_name?: string
    app_id?: string
    platform?: string
    vc_name?: string
    vc_exchange_rate?: string
    vc_callback_url?: string
    vc_desc?: string
    vc_secret_key?: string
    status?: number
    id?: string
}

export interface ICurrencyForList {
    pkg_name?: string
    app_name?: string
    platform?: string
    id?: string
}

export interface SearchParams {
    pkg_name?: string,
    platform?: string,
}