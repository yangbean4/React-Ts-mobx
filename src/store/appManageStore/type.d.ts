import { AppManageStore as AppManageStoreModel } from './index'
import { number } from 'prop-types';
import { title } from '@views/AppGroup/AppGroupModal/Placement/index.scss';

export as namespace IAppManageStore

export interface AppManageStore extends AppManageStoreModel { }

export interface IAppMange {
    app_key?: number | string
    status?: number
    platform?: string
    appstore_url?: string
    app_id?: string
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
}


export interface OptionListDb {
    Category?: any[],
    Frame?: any[],
    Spec?: any[],
    Style?: any[]
}
