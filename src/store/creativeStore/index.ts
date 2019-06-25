import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'
import { async } from 'q';

export class CreativeStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof CreativeStore
     */
    @observable
    getCreativeLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {ICreativeStore.ICreative[]}
     * @memberof CreativeStore
     */
    @observable
    creativeList: ICreativeStore.ICreativeForList[] = []

    @observable
    creative: ICreativeStore.ICreative
    /**
     * table page
     *
     * @type {number}
     * @memberof CreativeStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof CreativeStore
     */
    @observable
    pageSize: number = 10
    /**
     * creativeList total
     *
     * @type {number}
     * @memberof CreativeStore
     */
    @observable
    total: number = 0

    @observable
    filters: ICreativeStore.SearchParams = {}

    @observable
    optionListDb: ICreativeStore.OptionListDb = {
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
     * 加载用户列表
     *
     * @memberof CreativeStore
     */

    @action
    getCreative = async () => {
        this.getCreativeLoading = true
        try {
            const res = await this.api.creative.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.creativeList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.creativeList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getCreativeLoading = false
        })
    }

    createCreative = async (creative: ICreativeStore.ICreative) => {
        const res = await this.api.creative.createCreative(creative)
        // this.changepage(1)
        return res
    }

    modifyCreative = async (creative: ICreativeStore.ICreative) => {
        const res = await this.api.creative.modifyCreative(creative)
        // this.changepage(1)
        return res
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getCreative()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCreative()
    }

    @action
    changeFilter = (data: ICreativeStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setCreative = (creative: ICreativeStore.ICreative) => {
        this.creative = creative
    }
    @action
    clearCreative = () => {
        this.creative = undefined
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

export default new CreativeStore()
