import { IosWhiteListStore as IIosWhiteListStoreModel } from './index'

export as namespace IIosWhiteListStore

export interface IosWhiteListStore extends IIosWhiteListStoreModel { }

export interface IItem {
    id?: number
    bundle_id?: string
    platform?: string
    version?: string
    pt_url?: string
    pt_name?: string
    add_time?: int
    update_time?: string
}

export interface IitemForList {
    bundle_id?: string
    platform?: string
    version_number?: number
    pt_url?: string
}

export interface SearchParams {
    bundle_id?: string,
}


export interface OptionListDb {
    bundle_ids: any[]
}

