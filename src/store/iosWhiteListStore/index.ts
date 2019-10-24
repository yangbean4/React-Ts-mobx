import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class IosWhiteListStore extends StoreExt {
    /**
     * 加载列表时的loading
     *
     * @type {boolean}
     * @memberof IosWhiteListStore
     */
    @observable
    getListLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {IIosWhiteListStore.ICreative[]}
     * @memberof IosWhiteListStore
     */
    @observable
    list: IIosWhiteListStore.IitemForList[] = []

    @observable
    creative: IIosWhiteListStore.IItem
    /**
     * table page
     *
     * @type {number}
     * @memberof IosWhiteListStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof IosWhiteListStore
     */
    @observable
    pageSize: number = 10
    /**
     * list total
     *
     * @type {number}
     * @memberof IosWhiteListStore
     */
    @observable
    total: number = 0

    @observable
    filters: IIosWhiteListStore.SearchParams = {}

    @observable
    optionListDb: IIosWhiteListStore.OptionListDb = {
        bundle_ids: []
    }

    @action
    getBundleIds = async () => {
        const res = await this.api.config.fullConfig();
        runInAction('SET', () => {
            this.optionListDb.bundle_ids = res.data.ios
        })
    }

    /**
     * 加载数据列表
     *
     * @memberof IosWhiteListStore
     */

    @action
    getList = async () => {
        this.getListLoading = true
        try {
            const res = await this.api.ioswhitelist.getList({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.list = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.list = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getListLoading = false
        })
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getList()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getList()
    }

    @action
    changeFilter = (data: IIosWhiteListStore.SearchParams) => {
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

export default new IosWhiteListStore()
