import { EndcardTemplateStore as EndcardTemplateStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IEndcardTemplateStore

export interface EndcardTemplateStore extends EndcardTemplateStoreModel { }

export interface IEndcardTemplate {
  id?: number
  template_id?: string
  template_name?: string
  md5?: string
  version?: string
  template_image?: string
  template_url?: string
  status?: number
  template_type?: number
}

export interface SearchParams {
  template_name?: string,
  template_id?: string | number,
}