import { AppGroupStore as AppGroupStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IAppGroupStore

export interface AppGroupStore extends AppGroupStoreModel { }

export interface IAppGroup {
    status?: number
    platform?: string
    not_in_appstore?: number
    pkg_name?: string
    app_name?: string
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
    platform?: string,
    status?: number | string
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
}