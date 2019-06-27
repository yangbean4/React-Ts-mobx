import { AppGroupStore as AppGroupStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IAppGroupStore

export interface AppGroupStore extends AppGroupStoreModel { }

export interface IAppGroup {
    id?: number | string
    status?: number
    platform?: string
    not_in_appstore?: number
    pkg_name?: string
    app_name?: string
    bundle_id?: string
    logo?: string
    spec?: number
    category?: number
    frame?: number
    style?: number
    screen_type?: number
    apply_screen_type?: number
    account_id?: number
    dev_id?: string
    preload_ige_num?: number
    preload_video_num?: number
    preload_playicon_num?: number
    recover_num?: number
    is_block?: number
    recover_flag?: number
    contains_native_s2s_pid_types?: number
    sdk_token?: string
    s2s_token?: string
    ad_type?: string
    offer_limit?: string
    nations?: string[]
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
    pkg_name?: string,
    platform?: string[],
    status?: (number | string)[]
}


export interface OptionListDb {
    Category?: any[],
    Frame?: any[],
    Spec?: any[],
    Style?: any[],
    Account?: any[],
    PidType?: any[],
    VC?: any[],
    AppWall?: any[],
    Country?: any[]
}

export interface PlacementForList {
    id?: number
    pid_type_name?: string
    placement_name?: string
    placement_id?: string
    status?: string
}

export interface styleDetail {
    title_text?: string
    title_text_color?: string
    title_font?: string
    title_background_color?: string
    title_background_image?: string
    subtitle_text?: string
    subtitle_color?: string
    subtitle_background_color?: string
    subtitle_background_image?: string
    ad_title_color?: string
    ad_desc_color?: string
    ad_edge_color?: string
    ad_background_color?: string
    ad_background_image?: string
    button_text_color?: string
    button_background_color?: string
    button_background_image?: string
    button_edge_color?: string
    button_unavail_color?: string
    vc_icon?: string
    big_background_image?: string
    big_background_color?: string
    content_font?: string
}

export interface Placement {
    status?: number
    placement_id?: string
    placement_name?: string
    ige_carrier_support?: string[]
    frequency_num?: number
    frequency_time?: number
    accept_cpm?: number // 新增
    pid_type?: number
    min_offer_num?: number
    offer_num?: number
    budget?: number
    creative_type?: string[]

    // appwall add
    style_id?: number
    style_detail?: styleDetail
    // VC Reward add
    vc_id?: number
    reward_type?: number
    reward_num?: number
}
