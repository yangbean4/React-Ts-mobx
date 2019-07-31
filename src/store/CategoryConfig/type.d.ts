import { ICategoryConfigStore as CategoryConfigStore } from './index'

export as namespace ICategoryConfigStore
export interface ICategoryConfigStore extends CategoryConfigStore { }


export interface SearchParams {
    category_id?: string,
    scene?: string
}

export interface addCategoryParams {
    category_id?: number,
    data?:[{
        scene_code?: number,
        scene_name?:string,
        isdelete?:number
    }]
}

export interface showCategoryParams{
    number?:number[],
    scene_code?:any[],
    scene_name?:any[],
    isdelete_number?:any[],
    screne_id?:any[]
}