import { RevenueStore as RevenueStoreModel } from './index'
import { string } from 'prop-types';

export as namespace IRevenueStore

export interface RevenueStore extends RevenueStoreModel { }

export interface IRevenue {
  id?: number
  file_name?: string
  operator?: string
  status?: string
  add_time?: string
}

export interface IUpload {
  type?: number = 10
  file?: string
}
export interface SearchParams {
  file_name?: string,
  operator?: string[],
  status?: (string | number)[]
}