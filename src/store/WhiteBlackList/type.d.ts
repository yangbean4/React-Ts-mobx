import { WhiteBlackListStore as WhiteBlackListStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IWhiteBlackListStore
export interface WhiteBlackListStore extends WhiteBlackListStoreModel { }

export interface Iitem {
    dev_id?: string
    pkg_name?: string
    category_whitelist?: number[]
    app_id_blacklist?: string[]
}

export interface IitemForList {
    id?: number
    pkg_name?: string
    app_id?: string
    category_id?: string
    category?: string
    update_time?: string
}

export interface SearchParams {
    app_id?: string[],
    pkg_name?: string[],
    Category?: string[]
}


export interface OptionListDb {
    PkgnameData?: any[],
    Category?: any[],
}
