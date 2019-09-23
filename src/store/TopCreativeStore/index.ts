import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'


export class TopCreativeStore extends StoreExt {
    /**
     * 加载列表时的loading
     *
     * @type {boolean}
     * @memberof TopCreativeStore
     */
    @observable
    getTopCreativeLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {ITopCreativeStore.ICreative[]}
     * @memberof TopCreativeStore
     */
    @observable
    topCreativeList: ITopCreativeStore.ITopCreativeForList[] = []

    /**
     * table page
     *
     * @type {number}
     * @memberof TopCreativeStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof TopCreativeStore
     */
    @observable
    pageSize: number = 10
    /**
     * creativeList total
     *
     * @type {number}
     * @memberof TopCreativeStore
     */
    @observable
    total: number = 0

    @observable
    filters: ITopCreativeStore.SearchParams = {}

    @observable
    optionListDb: ITopCreativeStore.OptionListDb = {
        appIds: { ios: [], android: [] },
        language: [],
        CreativeType: [],
        LeadContents: {}
    }

    @action
    getOptionListDb = async () => {
        const keys = Object.keys(this.optionListDb)
        const promiseAll = keys.map(key => this.api.creative[`get${key}`]())
        Promise.all(promiseAll).then(data => {
            const target = {}
            keys.forEach((key, index) => {
                target[key] = data[index].data
            })
            runInAction('SET', () => {
                this.optionListDb = target
            })
        })
    }

    @action
    getContentList = async () => {
        const res = await this.api.creative.getLeadContents()
        runInAction('SET', () => {
            this.optionListDb.LeadContents = res.data
        })
    }

    /**
     * 加载列表
     *
     * @memberof TopCreativeStore
     */

    @action
    getTopCreative = async () => {
        this.getTopCreativeLoading = true
        try {
            const res = await this.api.topCreatives.getTopCreativeList({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.topCreativeList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.topCreativeList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getTopCreativeLoading = false
        })
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getTopCreative()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getTopCreative()
    }

    @action
    changeFilter = (data: ITopCreativeStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
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

export default new TopCreativeStore()
