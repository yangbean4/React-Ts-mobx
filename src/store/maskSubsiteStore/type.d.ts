/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-12-03 09:57:00
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-03 18:56:17
 */
import { MaskSubsiteStore as MaskSubsiteModel } from './index'

export as namespace IMaskSubsiteStore

export interface MaskSubsiteStore extends MaskSubsiteModel { }

export interface IMask {
  id?: number | string
  app_key?: number | string
  app_id?: string
  update_time?: string
  mask_id?: string
  pkg_name_num?: string
  subsite_ids?: string
  pkg_name_list?: ({
    [key: string]: string
  })[]
}

export interface OptionListDb {
  appIdData?: ({
    app_id?: string
    alias_key?: string
  })[],
  pkgNameData?: any[],
}

export interface SearchParams {
  app_key?: string[],
  mask_id?: string,
  subsite_id?: (string | number)[]
}