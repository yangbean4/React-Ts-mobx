
import { TopCreativeStore as TopCreativeStoreModel } from './index'

export as namespace ITopCreativeStore

export interface TopCreativeStore extends TopCreativeStoreModel { }

export interface ITopCreativeForList {
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

export interface SearchParams {
    app_id?: string,
    task_name?: string,
    geo?: (number | string)[],
    status?: string[],
    pkg_name?: string[],
    date?: string
}
