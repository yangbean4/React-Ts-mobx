/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-12 16:15:28
 * @LastEditors  :  bean^ <bean_4@163.com>
 * @LastEditTime : 2020-02-06 18:10:41
 */

import { TopCreativeStore as TopCreativeStoreModel } from './index'

export as namespace ITopCreativeStore

export interface TopCreativeStore extends TopCreativeStoreModel { }

export interface ITopCreativeForList {
    rank?: number,
    ids?: string,
    creative_type?: string,
    creative_type_name?: string,
    creative_id?: number,
    creative?: string,
    endcard_id?: number,
    endcard?: string,
    app_id?: string,
    platform?: string,
    data_duration?: string,
    impression?: string,
    ctr?: string,
    cvr?: string,
    ipm?: string,
    campaign_num?: number,
    campaign?: ICampaignForList[],
    preview: IPreview
    BD?: String
    AM?: String
    UI?: String
}

export interface ICampaignForList {
    campaign_id_name?: string,
    impression?: number,
    ctr?: string,
    cvr?: string,
    ipm?: string,
}


// 弹窗显示数据
export interface IPreview {
    app_id?: string,
    platform?: string,
    data_duration?: string,
    impression?: string,
    play?: string,
    click?: string,
    install?: string,
    play_rate?: string,
    ctr?: string,
    cvr?: string,
    ipm?: string,
    creative_type?: string,
    creative_type_name?: string,
    creative?: string,
    endcard?: string,
    campaign_num?: string,
    ige_leadvideo?: string,
    lead_content_image?: string,
    content?: string,
    ige_firstframe_image_url?: string,
    endcard_image_url?: string,
    online_url?: string,
    offline_url?: string,
    creative_url?: string,
    template_url?: string,
    BD?: String
    AM?: String
    UI?: String
}

export interface OptionListDb {
    Endcard?: {
        [key: string]: string
    }[],
    Creative?: {
        [key: string]: string
    }[]
}

export interface SearchParams {
    platform?: string[],
    endcard_id?: string[],
    creative_id?: string[],
    creative_type?: string[],
    data_start?: string,
    app_id?: string,
    ipm?: number,
    order_by?: string,
    sort?: string
    BD?: String
    AM?: String
    UI?: String
}
