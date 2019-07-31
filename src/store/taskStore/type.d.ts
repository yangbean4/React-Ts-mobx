import { TaskStore as TaskStoreModel } from './index'
import { number } from 'prop-types';

export as namespace ITaskStore
export interface TaskStore extends TaskStoreModel { }

export interface ITask {
    task_name?: string
    ige_pkgname?: string
    app_id?: string
    scene_id?: string
    geo?: string
    date?: string
    pkg_name?: string
    priority?: number
    remark?: string
}

export interface ITaskForList {
    id?: number
    task_name?: string
    app_id?: string
    scene_name?: string
    geo?: string
    ige_pkgname?: string
    pkg_name?: string
    priority?: number
    remark?: string
    sen_scene_img_config?: sceneType[]
    sen_scene_img_list?: sceneType[]
    task_process_status?: number
    zip_url?: string
    split_data_url?: string
    scene_data?: string
    add_time?: string
    update_time?: string
}

export interface SearchParams {
    app_id?: string,
    task_name?: string,
    GEO?: (number | string)[],
    status?: string[],
    pkg_name?: string[],
    date?: string
}


export interface OptionListDb {
    PkgnameData?: any[],
    Country?: any[],
    IgePkgname?: any[]
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
    offer_rate?: number
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
