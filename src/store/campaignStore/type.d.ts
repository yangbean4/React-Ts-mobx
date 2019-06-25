import { CampaignStore as CampaignStoreModel } from './index'

export as namespace ICampaignStore

export interface CampaignStore extends CampaignStoreModel { }

export interface ICampaignGroup {
    id?: number | string
    app_key?:string
    app_id?: string
    platform?: string[]
    status?: number
    campaign_name?: string
    target_code?: string
    bid_type?: string
    bid?: number
    total_budget?: number
    daily_budget?: number
    start_time?: string
    end_time?: string
    comment_group_id?: number
    ad_type?: number
    tracking_url?: string
    impression_url?: string
    creative_id?: number
    endcard_id?: number
    default_cpm?: number
    kpi?: string
}

export interface IAppInfo {
    app_id?: string
    platform?: string[]
    status?: number[]
}

export interface SearchParams {
    app_id?: string,
    platform?: string[],
}

export interface ICampainginForList {
    app_key?: string
    app_id?: string
    platform?: string
    id?: string
}

export interface OptionListDb {
    Appkey?: any[],
    TargetCode?: any[],
    CommentID?: any[],
    AdType?: any[],
    Creative?: any[],
    Endcard?: any[],
}
