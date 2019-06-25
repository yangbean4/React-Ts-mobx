import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class EndcardStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof EndcardStore
     */
    @observable
    getEndcardLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {IEndcardStore.IEndcard[]}
     * @memberof EndcardStore
     */
    @observable
    endcardList: IEndcardStore.IEndcardForList[] = []

    @observable
    endcard: IEndcardStore.IEndcard
    /**
     * table page
     *
     * @type {number}
     * @memberof EndcardStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof EndcardStore
     */
    @observable
    pageSize: number = 10
    /**
     * endcardList total
     *
     * @type {number}
     * @memberof EndcardStore
     */
    @observable
    total: number = 0

    @observable
    filters: IEndcardStore.SearchParams = {}

    @observable
    optionListDb: IEndcardStore.OptionListDb = {
        appIds: { ios: [], android: [] },
        language: [],
        endcards: [],
        template: [],
    }

    @action
    getOptionListDb = async () => {
        const keys = Object.keys(this.optionListDb)
        const promiseAll = keys.map(key => this.api.endcard[`get${key}`]())
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
     * @memberof EndcardStore
     */

    @action
    getEndcard = async () => {
        this.getEndcardLoading = true
        try {
            const res = await this.api.endcard.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.endcardList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.endcardList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getEndcardLoading = false
        })
    }

    createEndcard = async (endcard: IEndcardStore.IEndcard) => {
        const res = await this.api.endcard.createEndcard(endcard)
        // this.changepage(1)
        return res
    }

    modifyEndcard = async (endcard: IEndcardStore.IEndcard) => {
        const res = await this.api.endcard.modifyEndcard(endcard)
        // this.changepage(1)
        return res
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getEndcard()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getEndcard()
    }

    @action
    changeFilter = (data: IEndcardStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setEndcard = (endcard: IEndcardStore.IEndcard) => {
        this.endcard = endcard
    }
    @action
    clearEndcard = () => {
        this.endcard = undefined
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

export default new EndcardStore()
