import { StrategyGroupStore as StrategyGroupStoreModel } from './index'
import { number } from 'prop-types';

export as namespace IStrategyGroupStore
export interface StrategyGroupStore extends StrategyGroupStoreModel { }

export interface IitemForList {
    id?: number
    strategy_name?: string
    add_time?: string
}

export interface SearchParams {
    strategy_name?: string
}
