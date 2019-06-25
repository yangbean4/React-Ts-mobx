import { CreativeStore as CreativeStoreModel } from './index'

export as namespace ICreativeStore

export interface CreativeStore extends CreativeStoreModel { }

export interface ICreative {
    id?: number
    platform?: string
    app_id?: string
    app_name?: string

    status?: int
    app_key?: string
    creative_name?: string
    language?: string
    version?: string
    order_id?: number | string
    creative_type?: string
    video_type?: number
    videoUrl?: string
    lead_is_show_content?: number
    lead_content_id?: number
    creative_icon_url?: string
    description?: string
    if_show_comment?: string
    ige_prefail?: number
    videoUrl?: string
    leadVideoUrl?: string
    ige_portrait_offline_url?: string | number
    ige_landscape_offline_url?: string | number
    ige_portrait_video_cover_url?: string | number
    ige_landscape_video_cover_url?: string | number
    ige_pkgname?: string | number
    ige_leadvideo_flag?: string | number
    desc?: string | number
    ige_recoverlist_opps?: string | number
    ige_recoverlist_re_en?: string | number
    ige_switch_scene?: string | number
    playback_time?: number
    long_play_time?: string | number
    title?: string
    ige_landscape_video_cover_url?: string | number
    ige_pkgname?: string | number
    ige_leadvideo_flag?: string | number
    desc?: string | number
    ige_recoverlist_opps?: string | number
    ige_recoverlist_re_en?: string | number
    ige_switch_scene?: string | number
    playback_time?: number
    long_play_time?: string | number
    skip_to?: string

    playicon_creative_offline_url?: string | number
}

export interface ICreativeForList {
    // creative_name?: string
    // language?: string
    // creative_image_url?: string
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
    CreativeType?: ({
        id?: string | number
        creative_name: string
    })[],
    LeadContents?: {
        [propName: string]: ({
            name?: string
            id?: number
        })[]
    }
}