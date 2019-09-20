import { ManualStore as ManualEcpmStore } from './index'

export as namespace IManualEcpmStore

export interface ManualStore extends ManualEcpmStore { }


export interface IList {
  id?: string
  app_id?: string
  campaign_id: string
  campaign_name?: string
  country?: string
  pkg_name?: string
  pid?: string
  placement_name?: string
  pid_type_name?: string
  cpm?: string
  update_time?: string
  Operate?: string
}

export interface IAppidCampaign {
  [key: string]: ICampaign[]
}

export interface ICampaign {
  app_id: string;
  campaign_id: string;
  campaign_id_name: string;
}

export interface IPid {
  pkg_name: string;
  placement_id: string;
  placement_id_name: string;
}

export interface SearchParams {
  app_id?: string | number,
  campaign_id?: string | number,
  country?: Array
  pkg_name?: string
  pid?: string
  pid_type?: Array
}

export interface CommitParams {
  app_id?: string | number,
  campaign_id?: string | number,
  country?: Array
  pkg_name?: string
  pid?: string
  cpm?: string | number
}
