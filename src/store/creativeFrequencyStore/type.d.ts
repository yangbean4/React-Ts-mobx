import { CreativeFrequencyStore as CreativeFrequencyStoreModel } from './index'
import { number } from 'prop-types';
import { ICreative } from 'store/creativeStore/type';

export as namespace ICreativeFrequencyStore

export interface CreativeFrequencyStore extends CreativeFrequencyStoreModel { }

export interface IitemForList {
  id?: number
  dev_id?: string
  pid_type?: number
  creative_id?: string
  limit_num?: number
  limit_time?: number
  add_time?: string
  update_time?: string
  pkg_name?: string
  creative_name?: string
}


export interface Iitem {
  dev_id?: number
  pid_type?: number[]
  creative_id?: number[]
  limit_num?: number
  limit_time?: number
}

export interface SearchParams {
  pkg_name?: string
  creative?: number[]
  pid_type?: number[]
}



export interface OptionListDb {
  creatives?: {
    id: number,
    name: string
  }[],
  pkgnames?: any[]
}
