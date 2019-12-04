/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-24 09:57:07
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-04 14:27:49
 */
import { AppManageStore as AppManageStoreModel } from './index'
import { number } from 'prop-types';
import { title } from '@views/AppGroup/AppGroupModal/Placement/index.scss';

export as namespace IAppManageStore

export interface AppManageStore extends AppManageStoreModel { }

export interface IAppMange {
    app_key?: number | string
    app_id?: string
    status?: number
    platform?: string
    appstore_url?: string
    account_id?: number
    screen_type?: string
    logo?: string
    title?: string
    rating?: string
    downloads?: number | string
    category_id?: number
    frame_id?: number
    specs_id?: number
    style_id?: number,
    kpi?: any,
    event_config?: any,
}

export interface IAppGplist {
    title?: string
    logo?: string
    desc?: string
    rating?: number
    os_version?: string
    category?: string
    appstore_url?: string
}

export interface SearchParams {
    app_id?: string,
    platform?: string[],
    status?: (number | string)[]
    category_id?: number[]
    export?: number
    account_name?: number[]
}


export interface OptionListDb {
    Category?: any[],
    Frame?: any[],
    Spec?: any[],
    Style?: any[]
    Account?: any[]
}
