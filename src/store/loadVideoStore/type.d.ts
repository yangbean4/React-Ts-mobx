import { LoadVideoStore as ILoadVideoStoreModel } from './index'

export as namespace ILoadVideoStore

export interface LoadVideoStore extends ILoadVideoStoreModel { }

export interface IItem {
    id?: number
    pkg_name?: string
    bundle_id?: string
    platform?: string
    template_name?: string
    portrait_name?: string
    portrait_md5?: string
    portrait_url?: string
    landscape_name?: string
    landscape_md5?: string
    landscape_url?: string
    add_time?: string
    update_time?: string
    loadvideo_id?: number
}
export interface IitemForList {
    pkg_name?: string
    bundle_id?: string
    platform?: string
    version_number?: number
    update_time?: string
}

export interface SearchParams {
    pkg_name?: string,
    bundle_id?: string,
    template_name?: string,
    template_md5?: string
}


export interface OptionListDb {
    ios: string[]
    android: string[]
}

