import { H5ExportStore as H5ExportStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IH5ExportStore

export interface H5ExportStore extends H5ExportStoreModel { }

export interface IitemForList {
  app_key?: string
  app_id?: string
  campaign_id?: string
  campaign_name?: string
  offer_id?: string
  offer_status?: string
  subsite_id?: string
  pkg_name?: string
  token?: string
  pid?: string
  preclick?: number
  link?: string
}


export interface Iitem {
  app_id?: string
  campaign_id?: string
  offer_id?: string
  dev_id?: string
  token?: string
  pid?: string
  preclick?: number
}

export interface SearchParams {
  app_id?: string
  campaign_id?: string
  pkg_name?: string
  offer_id?: string
  offer_status?: string[]
  pid?: string
}



export interface OptionListDb {
  chooseList?: ChooseList
  subsiteInfo?: SubsiteInfo[]
}

export interface ChooseList {
  [index: string]: ChooseListItem[]
}
export interface ChooseListItem {
  app_key: string
  app_id: string
  campaign_id: number
  campaign_name: string
  id: number
  offer_status: string
}

export interface SubsiteInfo {
  dev_id: string
  pkg_name: string
  token: string
  placement_id: string
}

