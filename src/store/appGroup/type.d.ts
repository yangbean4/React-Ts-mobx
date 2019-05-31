import { AppGroupStore as AppGroupStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IAppGroupStore

export interface AppGroupStore extends AppGroupStoreModel { }

export interface IAppGroup {
    pkg_name?: string
    app_id?: string
    platform?: string
    vc_name?: string
    vc_exchange_rate?: string
    vc_callback_url?: string
    vc_desc?: string
    vc_secret_key?: string
    status?: number
}

export interface IAppGroupForList {
    pkg_name?: string
    platform?: string
    id?: string
    Status?: number
    app_name?: string
}

export interface SearchParams {
    pkg_name?: string,
    platform?: string,
}