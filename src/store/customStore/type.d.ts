import { CustomStore as CustomStoreModel } from './index'
import { string, number } from 'prop-types';

export as namespace ICustomStore

export interface CustomStore extends CustomStoreModel { }

export interface ICustom {
  id?: number
  pid?: number
  status?: number
  primary_name?: string
  template_name?: string
  config?: TemplateConfig | string
}
export interface ICustomTree extends ICustom {
  children?: ITemplate[]
}

export interface SearchParams {
  primary_name?: string,
}