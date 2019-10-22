import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { dateFormat } from '@utils/index'
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
            const filters = this.filters;
            if (filters.export) {
                const res = await this.api.appsManage.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters }, { responseType: 'blob' });
                const blob = new Blob([res])
                console.log(res);
                const data = dateFormat(new Date, "yyyy-MM-dd");
                const fileName = `Apps-${data}.xlsx`
                if ('download' in document.createElement('a')) { // 非IE下载
                    const elink = document.createElement('a')
                    elink.download = fileName
                    elink.style.display = 'none'
                    elink.href = URL.createObjectURL(res.data)
                    document.body.appendChild(elink)
                    elink.click()
                    URL.revokeObjectURL(elink.href) // 释放URL 对象
                    document.body.removeChild(elink)
                } else { // IE10+下载
                    navigator.msSaveBlob(blob, fileName)
                }
            } else {
                const res = await this.api.appsManage.getAppsManage({ page: this.page, pageSize: this.pageSize, ...this.filters })

                runInAction('SET_USER_LIST', () => {
                    this.appManageList = res.data
                    this.total = res.total
                })
            }

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
        runInAction('del', () => {
            delete this.filters.export;
        })
        this.page = page
        this.getAppManageList()
    }

    @action
    changePageSize = (pageSize: number) => {
        runInAction('del', () => {
            delete this.filters.export;
        })
        this.pageSize = pageSize
        this.getAppManageList()
    }

    @action
    changeFilter = (data: IAppManageStore.SearchParams, n?: number) => {
        this.filters = data;
        n ? this.getAppManageList() : this.changepage(1)
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
