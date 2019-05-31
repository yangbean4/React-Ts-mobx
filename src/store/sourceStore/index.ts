import { observable, action, runInAction } from "mobx"
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class SourceStore extends StoreExt {
    /**
     * 加载sourceCompany时的loading
     */
    @observable
    getSourceloading: boolean = false

    /**
     * source company list
     */
    @observable
    sourceList: ISourceStore.ISource[] = []

    /**
     * source company item
     */

    @observable
    sourceItem: ISourceStore.ISource

    /**
     * table page
     */
    @observable
    page: number = 1

    /**
     * table size
     */
    @observable
    pageSize: number = 10

    /**
     * table total
     */
    @observable
    total: number = 0

    /**
     * table filters
     */
    @observable
    filters: ISourceStore.SearchParams = {}

    /**
     * get source list
     */
    @action
    getSourcecompany = async () => {
        this.getSourceloading = true
        try {
            const res = await this.api.source.getSourcecompanys({page: this.page, pageSize: this.pageSize, ...this.filters})
            runInAction('SET_SOURCE_LIST', () => {
                this.sourceList = res.data
                this.total = res.total
            })
        } catch (error) {
            runInAction('SET_SOURCE_LIST', () => {
                this.sourceList = []
                this.total = 0
            })
        }
        runInAction('HIDE_SOURCE_LOADING', () => {
            this.getSourceloading = false
        })
    }

    @action
    createSourcecompany = async (param: ISourceStore.ISource) => {
        const res = await this.api.source.createSourcecompany(param)
        return res
    }

    @action
    modifySourcecompany = async () => {
        // 表单提交
    }

    @action
    changePage = (page: number) => {
        this.page = page
        this.getSourcecompany()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getSourcecompany()
    }
    /**
     * pagination click
     */
    handleTableChange = (pagination: PaginationConfig) => {
        const {current, pageSize} = pagination
        if (current !== this.page) {
            this.changePage(current)
        }
        if (pageSize !== this.pageSize) {
            this.changePageSize(pageSize)
        }
    }
}

export default new SourceStore()