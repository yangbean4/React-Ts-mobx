import { LeadContentStore as LeadContentStoreModel } from './index'

export as namespace ILeadContentStore

export interface LeadContentStore extends LeadContentStoreModel { }

export interface ILeadContent {

    id?: number
    platform?: string
    // app_id?: string
    // app_name?: string

    status?: int
    app_key?: string
    version?: string
    order_id?: number | string
    language?: string
    name?: string
    content?: string
    content_md5?: string
}

export interface ILeadContentForList {
    // leadContent_name?: string
    // language?: string
    // leadContent_image_url?: string
    // template_id?: string
    // status?: number
    app_id?: string
    platform?: string
    app_key?: string
}

export interface SearchParams {
    app_id?: string,
    platform?: string,
}


export interface OptionListDb {
    appIds?: {
        ios?: string[]
        android?: string[]
    },
    language?: string[],
    LeadContentType?: ({
        id?: string | number
        leadContent_name: string
    })[],
}