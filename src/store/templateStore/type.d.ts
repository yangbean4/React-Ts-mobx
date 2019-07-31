import { TemplatesStore as TemplatesStoreModel } from './index'

export as namespace ITemplateStore

export interface TemplatesStore extends TemplatesStoreModel { }

export interface ITemplate {
  id?: number
  template_name?: string
  version?: string
  template_url?: string
  template_md5?: string
  template_type?: number
}

export interface SearchParams {
  template_name?: string,
  version?: string | number,
  template_md5?: string | number,
}