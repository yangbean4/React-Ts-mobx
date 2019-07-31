import { CommentStore as CommentStoreModel } from './index'

export as namespace ICommentStore

export interface CommentStore extends CommentStoreModel { }
// 定义TPl表单的接口
export interface IComment {
    id?: number
    status?: 0 | 1
    language?: string
    head_portrait?: string
    com_name?: number
    com_talk?: string
}
export interface SearchParams {
    id?: number
    language?: string[]
}

export interface OptionListDb {
    language?: string[]
}
