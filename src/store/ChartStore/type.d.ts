/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-11-01 15:04:00
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-05 10:21:33
 */

import { ChartStore as ChartStoreModel } from './index'

export as namespace IChartStore

export interface ChartStore extends ChartStoreModel { }

export interface SearchGroup {
  pkg_name?: string
  platform?: string
  pid?: string
  strategy?: string
  app_key?: string
  creative_id?: string
  impression?: string
  date?: string
}

export interface OptionListDb {
  strategyList?: ({ id: string, strategy_name: string })[]
  placementEcpmList?: ({ id: string, placement_name: string })[]
  pkgNameList?: ({ id: string, pkg_name: string })[]
  appKeyList?: ({ app_key: number, title: string })[]
  creativeList?: ({ id: string, name: string })[]
}

export interface DataItem extends SearchGroup {
  app_id: string
  campaign_id: string
  campaign_name: string
  country: string
  pkg_name: string
  pid: string
  placement_name: string
  pid_type_name: string
  cpm: string
  update_time: string
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
