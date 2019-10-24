import { WhiteBlackListStore as WhiteBlackListStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IWhiteBlackListStore
export interface WhiteBlackListStore extends WhiteBlackListStoreModel { }

export interface Iitem {
    dev_id?: string
    pkg_name?: string
    category_whitelist?: number[]
    app_id_blacklist?: string[]
    limited?: number
    platform?: string
    placement_campaign?: {
        placement_id: string
        type: number
        campaign_id: number[]
    }[],
    placement?: any[]
}

export interface IitemForList {
    id?: number
    pkg_name?: string
    app_id?: string
    category_id?: string
    category?: string
    update_time?: string
    placement_campaign?: string[]
}

export interface SearchParams {
    app_id?: string[],
    pkg_name?: string[],
    Category?: string[],
    placement_id?: string[],
    type?: number[],
    campaign_id?: number[]
}


export interface OptionListDb {
    PkgnameData?: any[],
    Category?: any[],
    AppidCampaign?: any[],
    PkgNamePlacement?: any[],
    campaigns?: any[],
    placements?: any[]
}

export interface TableModalList {
    campaign_id_name: string
    type: string
    placement_name_id: string

}
