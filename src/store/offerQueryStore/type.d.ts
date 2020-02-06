/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-09-09 18:02:04
 * @LastEditors  :  bean^ <bean_4@163.com>
 * @LastEditTime : 2020-02-06 18:00:24
 */
import { OfferQueryStore as OfferQueryStoreModel } from './index'

export as namespace IOfferQueryStore

export interface OfferQueryStore extends OfferQueryStoreModel { }

export interface IQuery {
  id?: number
  app_id?: string
  app_key?: string
  platform?: string[]
  creative_type?: string[]
  geo?: string[]
  campaign_id?: number
  account_id?: number
  ad_type?: string[]
  campaign_status?: string[]
  offer_status?: string[]
  BD?: String
  AM?: String
  UI?: String
}
export interface OptionListDb {
  geo?: string[]
  account_id?: string[]
}

export interface SearchParams {
  id?: string | number,
  app_id?: string,
  platform?: string[],
  creative_type?: string[]
  geo?: string[]
  campaign_id?: number
  account_id?: number
  ad_type?: string[]
  campaign_status?: string[]
  offer_status?: string[]
  creative_id?: string[]
  endcard_id?: string[]
  BD?: String
  AM?: String
  UI?: String
}
