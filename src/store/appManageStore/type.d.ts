import { AppManageStore as AppManageStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IAppManageStore

export interface AppManageStore extends AppManageStoreModel { }

export interface IAppMange {
    app_key?: number | string
    status?: number
    platform?: string
    appstore_url?: string
    app_id?: string
    account_id?: number
    screen_type?: string
    logo?: string
    app_name?: string
    rate?: string
    downloads?: number | string
    category_id?: string
    frame_id?: string
    specs_id?: string
    type_id?: string
}

export interface IAppGroupForList {
    pkg_name?: string
    platform?: string
    id?: string
    status?: number
    app_name?: string
    sdk_token?: string
}

export interface SearchParams {
    app_id?: string,
    platform?: string[],
    status?: (number | string)[]
}


export interface OptionListDb {
    Category?: any[],
    Frame?: any[],
    Spec?: any[],
    Style?: any[],
    Account?: any[]
}
