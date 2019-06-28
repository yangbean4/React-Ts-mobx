import { CommentGroupStore as CommentGroupStoreModel } from './index'

export as namespace ICommentGroupStore

export interface CommentGroupStore extends CommentGroupStoreModel { }

// 定义Group
export interface IGroup {
    id?: number
    status?: 0 | 1
    group_name?: string
    group_language?: string
    group_template_ids?: string
    comments?: string[]
}

export interface SearchGroup {
    group_name?: string
    group_language?: string[]
}

export interface OptionListDb {
    language?: string[]
 }