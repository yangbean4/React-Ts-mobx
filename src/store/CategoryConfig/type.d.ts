import { ICategoryConfigStore as CategoryConfigStore } from './index'

export as namespace ICategoryConfigStore
export interface ICategoryConfigStore extends CategoryConfigStore { }

export interface IList {
    
}
export interface SearchParams {
    category_id?: string,
    scene?: string
}

export interface addCategoryParams {
    category_id?: number,
    scene_code?: number,
    scene_name?:string
}