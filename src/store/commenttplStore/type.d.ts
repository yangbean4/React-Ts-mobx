import { CommentStore as CommentStoreModel } from './index'

export as namespace ICommentStore

export interface CommentStore extends CommentStoreModel { }
// 定义表单的接口
export interface IComment {
    id?: number
    status?: 0 | 1
    language?: string
    head_portrait?: string
    com_name?: number
    com_talk?: number
}
export interface SearchParams {
    language?: string,
    id?: number
}