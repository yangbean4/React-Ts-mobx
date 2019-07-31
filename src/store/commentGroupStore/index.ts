import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class CommentGroupStore extends StoreExt {
    /**
     * 加载comments-loading
     *
     * @type {boolean}
     * @memberof commentGroupStore
     */
    @observable
    getcommentsLoading: boolean = false

    @observable
    commentType: string
    /**
     * 用户列表
     *
     * @type {ICommentStore.IGroup[]}
     * @memberof commentGroupStore
     */
    @observable
    comments: ICommentGroupStore.IGroup[] = []

    @observable
    comment: ICommentGroupStore.IGroup
    /**
     * table page
     *
     * @type {number}
     * @memberof commentGroupStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof commentGroupStore
     */
    @observable
    pageSize: number = 10
    /**
     * accounts total
     *
     * @type {number}
     * @memberof commentGroupStore
     */
    @observable
    total: number = 0

    @observable
    filters: ICommentGroupStore.SearchGroup = {}

    @action
    setCommentType = (commentType: string) => {
        this.commentType = commentType
        this.changeFilter({})
        this.pageSize = 10
    }

    /**
     * 加载用户列表
     *
     * @memberof commentGroupStore
     */

    @action
    getCommentGroups = async () => {
        this.getcommentsLoading = true
        try {
            let data = {
                page: this.page, pageSize: this.pageSize, ...this.filters,
            }
            const res = await this.api.comment.getCommentGroup(data)
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

    createComment = async (comment: ICommentGroupStore.IGroup) => {
        const res = await this.api.comment.addCommentGroup(comment)
        this.changepage(1)
        return res
    }

    @action
    modifyComment = async (comment: ICommentGroupStore.IGroup) => {
        const res = await this.api.comment.modifyCommentGroup(comment)
        this.changepage(1)
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getCommentGroups()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCommentGroups()
    }

    @action
    changeFilter = (data: ICommentGroupStore.SearchGroup) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setComment = (comment: ICommentGroupStore.IGroup) => {
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

export default new CommentGroupStore()
