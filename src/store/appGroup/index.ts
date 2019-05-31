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
    appGroup: IAppGroupStore.IAppGroup
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

    /**
     * 加载用户列表
     *
     * @memberof AppGroupStore
     */

    @action
    getAppGroup = async () => {
        this.getAppGroupLoading = true
        try {
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
        this.changepage(1)
        return res
    }

    @action
    modifyAppGroup = async (appGroup: IAppGroupStore.IAppGroup) => {
        // const { id, role, status, pwd } = appGroup
        // return await this.api.appGroup.modifyAppGroup({ id, role, status, pwd })
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
        this.appGroup = undefined
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
