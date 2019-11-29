/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-11-01 15:04:00
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-05 12:20:12
 */

import { ChartStore as ChartStoreModel } from './index'

export as namespace IChartStore

export interface ChartStore extends ChartStoreModel { }

export interface SearchGroup {
  pkg_name?: string
  platform?: string
  pid?: string[]
  strategy?: string
  app_key?: string
  creative_id?: string
  impression?: string
  date?: any[] | string
}

export interface pkgName {
  id: string,
  pkg_name: string,
  bundle_id: string,
  platform: 'android' | 'ios'
}

export interface OptionListDb {
  strategyList?: ({ id: string, strategy_name: string })[]
  placementEcpmList?: ({ accept_ecpm: string, placement_name: string, placement_id: string })[]
  pkgNameList?: pkgName[]
  appKeyList?: ({
    alias_key: number,
    app_id: string,
    platform: 'android' | 'ios'
    title: string
  })[]
  creativeList?: ({ id: string, name: string })[]
}

export interface DataItem extends SearchGroup {
  app_id: string
  campaign_id: string
  campaign_name: string
  country: string
  strategy_id: string
  pkg_name: string
  pid: string
  placement_name: string
  pid_type_name: string
  cpm: string
  update_time: string
  strategy_name: string
  bundle_id: string
  fill_rate: number
  ipm: number
  ctr: number
  cvr: number
  title: string
  source_account_name: string
  lowest_ecpm: string
}

export interface ChartItem {
  data: DataItem,
  x: string | number,
  y: string | number,
  count: number,
  legend: string | number,
}

export interface IDetailData {
  '1': ChartItem[],
  '2': ChartItem[]
}

export type modeltype = '1' | '2';
