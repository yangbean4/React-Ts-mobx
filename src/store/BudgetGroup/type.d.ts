import { BudgetStore as BudgetStoreModel } from './index'

export as namespace IBudgetGroupStore

export interface budgetStore extends BudgetStoreModel { }

// 定义Group
export interface SearchParams {
    group_name?: string
    source_account?: string
    app_id?: string
    campaign?: string
}

export interface ITableList {
    id?: string
    app_id?: string
    app_key?: string
    daily_budget?: string
    group_name?: string
    sen_campaign?: string
    update_time?: string
    user_name?: string
    Operate?: string
}

export interface OptionList {
    app_id?: string
    app_key?: string
    id?: string
    user_name?: string
    campaign_id?: string
    status?: string
    campaign_name?: string
}
export interface AddBudgetParams {
    group_name?: string
    sen_group_id?: number
    sen_app_key?: string
    campaign?: Array
    daily_budget?: number|string
    user_name?:string
}

export interface CampaignRelated {
    app_id?: string
    app_key?: string
    campaign_name?: string
}

export interface OptionListDb {
    accountData?: any[]
    appIdData?: any[]
    campaign?: any[]
}

export interface campaignsData {
    accountData?: {}
    appIdData?: {}
};

export interface campaignParam{
    campaign_id?:string
    campaign_name?:string
}


export interface campaignOption{
    id?:string
    name?:string
}


export interface accountOption{
    id?:number
    user_name?:string
}