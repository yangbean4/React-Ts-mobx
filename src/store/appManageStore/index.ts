import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class AppManageStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof appManageStore
     */
    @observable
    getAppManageLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {IAppGroupStore.IAppGroup[]}
     * @memberof appManageStore
     */
    @observable
    appManageList: IAppManageStore.IAppMange[] = []

    @observable
    appManage: IAppManageStore.IAppMange = {}
    /**
     * table page
     *
     * @type {number}
     * @memberof appManageStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof appManageStore
     */
    @observable
    pageSize: number = 10
    /**
     * appGroupList total
     *
     * @type {number}
     * @memberof appManageStore
     */
    @observable
    total: number = 0

    @observable
    filters: IAppManageStore.SearchParams = {}

    @observable
    optionListDb: IAppManageStore.OptionListDb = {
        Category: [],
        Frame: [],
        Spec: [],
        Style: []
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
        const promiseAll = keys.map(key => this.api.appGroup[`get${key}`]())
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
    getAppManageList = async () => {
        this.getAppManageLoading = true
        try {
            const res = await this.api.appsManage.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.appManageList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.appManageList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getAppManageLoading = false
        })
    }

    createAppManage = async (appGroup: IAppManageStore.IAppMange) => {
        const res = await this.api.appsManage.createAppsManage(appGroup)
        this.setAppManage({ ...appGroup })
        return res
    }

    @action
    modifyAppManage = async (appGroup: IAppManageStore.IAppMange) => {
        this.setAppManage(appGroup)
        return await this.api.appsManage.modifyAppsManage(appGroup)
    }

    @action
    modifyAppsManageInfo = async (appManage: IAppManageStore.IAppMange) => {
        const res = await this.api.appsManage.modifyAppsManageInfo(appManage)
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getAppManageList()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getAppManageList()
    }

    @action
    changeFilter = (data: IAppManageStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setAppManage = (appManage: IAppManageStore.IAppMange) => {
        this.appManage = appManage
    }
    
    @action
    clearAppManage = () => {
        this.appManage = {}
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

export default new AppManageStore()
