import { EndcardStore as EndcardStoreModel } from './index'

export as namespace IEndcardStore

export interface EndcardStore extends EndcardStoreModel { }

export interface IEndcard {
    status?: int
    platform?: string
    app_id?: string
    version?: string
    order_id?: number
    endcard_name?: string
    language?: string
    template_id?: number | string
    endcard_image_url?: string
    cta?: string
    cta_text_col?: string
    cta_bkgd?: string
    cta_edge?: string
    cta_pic?: string
    automatic_jump?: number
    is_show?: number
    id?: string
}

export interface IEndcardForList {
    endcard_name?: string
    language?: string
    endcard_image_url?: string
    template_id?: string
    status?: number
    id?: string
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
    endcards?: ({
        id?: string | number
        name: string
    })[],
    template?: ({
        id?: string | number
        template_url?: string
    })[],
}