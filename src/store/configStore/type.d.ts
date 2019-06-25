import { ConfigStore as ConfigStoreModel } from './index'

export as namespace IConfigStore

export interface ConfigStore extends ConfigStoreModel { }

interface version {
  id?: number | string
  version?: number | string
}


export interface IConfig {
  versionArr?: version[]
  pkg_name?: string
  platform?: string
  totalConfig?: number
  bundle_id?: string
}

export interface IConfigTarget {
  config_deploy_id?: string | number
  basic1?: object | array
  basic2?: object | array
  pop?: object
  pid?: object | array
  pkg_name?: string
  config_version?: string
  platform?: string
}

export interface SearchParams {
  pkg_name?: string,
  platform?: string
  bundle_id?: string
}

export interface iosAndAnd {
  ios?: string[]
  android?: string[]
}