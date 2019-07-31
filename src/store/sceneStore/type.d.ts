import { SceneStore as SceneStoreModel } from './index'

export as namespace ISceneStore

export interface SceneStore extends SceneStoreModel { }

export interface IScene {
    id?: number
    scene_name?: string
    app_id?: string
    status?: 0 | 1
    category_name?: string
    status?: string
    app_key_app_id?:string
    app_key?: string
    first_scene?: sceneItem[]
    category_id?: string

}
export interface SearchParams {
    app_id?: string,
    category_id?: (string | number)[],
    status?: (string | number)[],
}

export interface sceneItem {
    id?: number
    scene_image_url: string[]
    sen_category_scene_config_id: number
    is_scene: 0 | 1
}

export interface ICategory {
    app_id?: string
    app_key?: string
    app_key_app_id?: string
    category_id?: string
    category_name?: string
    scene?: sceneType[]
}


export interface ICategoryLists {
    id?:number,
    name?:string
}

export interface sceneType {
    id: number // to  sen_category_scene_config_id
    name: string
    id_name: string
}

