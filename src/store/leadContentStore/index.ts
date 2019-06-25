import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class LeadContentStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof LeadContentStore
     */
    @observable
    getLeadContentLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {ILeadContentStore.ILeadContent[]}
     * @memberof LeadContentStore
     */
    @observable
    leadContentList: ILeadContentStore.ILeadContentForList[] = []

    @observable
    leadContent: ILeadContentStore.ILeadContent
    /**
     * table page
     *
     * @type {number}
     * @memberof LeadContentStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof LeadContentStore
     */
    @observable
    pageSize: number = 10
    /**
     * leadContentList total
     *
     * @type {number}
     * @memberof LeadContentStore
     */
    @observable
    total: number = 0

    @observable
    filters: ILeadContentStore.SearchParams = {}

    @observable
    optionListDb: ILeadContentStore.OptionListDb = {
        appIds: { ios: [], android: [] },
        language: [],
    }

    @action
    getOptionListDb = async () => {
        const keys = Object.keys(this.optionListDb)
        const promiseAll = keys.map(key => this.api.leadContent[`get${key}`]())
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
    /**
     * 加载用户列表
     *
     * @memberof LeadContentStore
     */

    @action
    getLeadContent = async () => {
        this.getLeadContentLoading = true
        try {
            const res = await this.api.leadContent.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.leadContentList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.leadContentList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getLeadContentLoading = false
        })
    }

    createLeadContent = async (leadContent: ILeadContentStore.ILeadContent) => {
        const res = await this.api.leadContent.createLeadContent(leadContent)
        // this.changepage(1)
        return res
    }

    modifyLeadContent = async (leadContent: ILeadContentStore.ILeadContent) => {
        const res = await this.api.leadContent.modifyLeadContent(leadContent)
        // this.changepage(1)
        return res
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getLeadContent()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getLeadContent()
    }

    @action
    changeFilter = (data: ILeadContentStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setLeadContent = (leadContent: ILeadContentStore.ILeadContent) => {
        this.leadContent = leadContent
    }
    @action
    clearLeadContent = () => {
        this.leadContent = undefined
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

export default new LeadContentStore()
