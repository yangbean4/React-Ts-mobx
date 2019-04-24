import { LogsStore as LogsStoreModel } from './index'

export as namespace ILogsStore

export interface LogsStore extends LogsStoreModel { }


export interface ILog {
  operator?: string
  type: string
  Object?: string
  operation?: string
  time?: string
}

export interface SearchParams {
  operator?: string | number,
  type?: string | number,
  operation?: string,
  time?: string[]
}