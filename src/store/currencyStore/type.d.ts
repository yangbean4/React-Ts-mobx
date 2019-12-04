/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-07-31 21:04:44
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-02 14:47:34
 */
import { CurrencyStore as CurrencyStoreModel } from './index'

export as namespace ICurrencyStore

export interface CurrencyStore extends CurrencyStoreModel { }

export interface ICurrency {
    app_name?: string
    pkg_name?: string
    app_id?: string
    platform?: string
    vc_name?: string
    vc_exchange_rate?: number
    vc_callback_url?: string
    vc_desc?: string
    vc_secret_key?: string
    status?: number
    reward_type?: number
    reward_num?: number
    id?: string
}

export interface ICurrencyForList {
    pkg_name?: string
    app_name?: string
    platform?: string
    id?: string
}

export interface SearchParams {
    pkg_name?: string,
    platform?: string,
    app_name?: string
}