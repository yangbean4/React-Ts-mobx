import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class CommentStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof AccountStore
     */
    @observable
    getcommentsLoading: boolean = false

    @observable
    commentType: string
    /**
     * 用户列表
     *
     * @type {IAccountStore.IAccount[]}
     * @memberof AccountStore
     */
    @observable
    comments: ICommentStore.IComment[] = []

    @observable
    comment: ICommentStore.IComment
    /**
     * table page
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    pageSize: number = 10
    /**
     * accounts total
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    total: number = 0

    @observable
    filters: ICommentStore.SearchParams = {}

    @action
    setCommentType = (commentType: string) => {
        this.commentType = commentType
        this.changeFilter({})
        this.pageSize = 10
    }

    /**
     * 加载用户列表
     *
     * @memberof AccountStore
     */

    @action
    getComments = async () => {
        this.getcommentsLoading = true
        try {
            let data = {
                page: this.page, pageSize: this.pageSize, ...this.filters,
                // type: this.accountType === 'source' ? 1 : 2
            }
            const res = await this.api.comment.getCommentTplList(data)
            runInAction('SET_COMMENT_LIST', () => {
                this.comments = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_COMMENT_LIST', () => {
                this.comments = []
                this.total = 0
            })
        }
        runInAction('HIDE_COMMENT_LIST_LOADING', () => {
            this.getcommentsLoading = false
        })
    }

    createComment = async (comment: ICommentStore.IComment) => {
        const res = await this.api.comment.addCommentItem(comment)
        this.changepage(1)
        return res
    }

    @action
    modifyComment = async (comment: IAccountStore.IAccount) => {
        const res = await this.api.comment.modifyCommentItem(comment)
        this.changepage(1)
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getComments()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getComments()
    }

    @action
    changeFilter = (data: ICommentStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setComment = (comment: ICommentStore.IComment) => {
        this.comment = comment
    }
    @action
    clearComment = () => {
        this.comment = undefined
    }

    handleTableChange = (pagination: PaginationConfig) => {
        const { current, pageSize } = pagination
        if (current !== this.page) {
            this.changepage(current)
        }
        if (pageSize !== this.pageSize) {
            this.changePageSize(pageSize)
        }
    }
}

export default new CommentStore()
