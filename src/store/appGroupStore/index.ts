import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class AppGroupStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof AppGroupStore
     */
    @observable
    getAppGroupLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {IAppGroupStore.IAppGroup[]}
     * @memberof AppGroupStore
     */
    @observable
    appGroupList: IAppGroupStore.IAppGroupForList[] = []

    @observable
    appGroup: IAppGroupStore.IAppGroup = {}
    /**
     * table page
     *
     * @type {number}
     * @memberof AppGroupStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof AppGroupStore
     */
    @observable
    pageSize: number = 10
    /**
     * appGroupList total
     *
     * @type {number}
     * @memberof AppGroupStore
     */
    @observable
    total: number = 0

    @observable
    filters: IAppGroupStore.SearchParams = {}

    @observable
    optionListDb: IAppGroupStore.OptionListDb = {
        Category: [],
        Frame: [],
        Spec: [],
        Style: [],
        Account: [],
        PidType: [],
        VC: [],
        AppWall: [],
        Country: []
    }

    @action
    getAccount = async () => {
        const res = await this.api.appGroup.getAccount()
        runInAction('SET', () => {
            this.optionListDb.Account = res.data;
        })
    }

    @action
    getCountry = async () => {
        if (this.optionListDb.Country.length) return;
        const res = await this.api.appGroup.getCountry()
        runInAction('SET', () => {
            this.optionListDb.Country = res.data;
        })
    }

    @action
    getVCList = async () => {
        const res = await this.api.appGroup.getVC({ id: this.appGroup.id })
        runInAction('SET', () => {
            this.optionListDb.VC = res.data;
        })
    }

    @action
    clearCache = () => {
        let target = {}
        Object.keys(this.optionListDb).forEach(key => target[key] = [])
        runInAction('CLEAR', () => {
            this.optionListDb = target
        })
    }

    @action
    getOptionListDb = async (id: number) => {
        const keys = Object.keys(this.optionListDb)
        const promiseAll = keys.map(key => this.api.appGroup[`get${key}`](
            key === 'VC' && this.appGroup ? { id: this.appGroup.id || id } : undefined
        ))
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
     * @memberof AppGroupStore
     */

    @action
    getAppGroup = async () => {
        this.getAppGroupLoading = true
        try {
            // const filters = {
            //     ...this.filters,
            //     status: this.filters.status ? this.filters.status.join(',') : undefined,
            //     platform: this.filters.platform ? this.filters.platform.join(',') : undefined,
            // }
            const res = await this.api.appGroup.getAppGroup({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.appGroupList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.appGroupList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getAppGroupLoading = false
        })
    }

    createAppGroup = async (appGroup: IAppGroupStore.IAppGroup) => {
        const res = await this.api.appGroup.createAppGroup(appGroup)
        this.setAppGroup({ ...appGroup, id: res.data.id })
        return res
    }

    @action
    modifyAppGroup = async (appGroup: IAppGroupStore.IAppGroup) => {
        this.setAppGroup(appGroup)
        return await this.api.appGroup.modifyAppGroup(appGroup)
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getAppGroup()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getAppGroup()
    }

    @action
    changeFilter = (data: IAppGroupStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setAppGroup = (appGroup: IAppGroupStore.IAppGroup) => {
        this.appGroup = appGroup
    }
    @action
    clearAppGroup = () => {
        this.appGroup = {}
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

export default new AppGroupStore()
