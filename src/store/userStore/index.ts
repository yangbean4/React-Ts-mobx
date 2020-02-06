import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class UserStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof UserStore
     */
    @observable
    getUsersloading: boolean = false
    /**
     * 用户列表
     *
     * @type {IUserStore.IUser[]}
     * @memberof UserStore
     */
    @observable
    users: IUserStore.IUser[] = []

    @observable
    user: IUserStore.IUser
    /**
     * table page
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    pageSize: number = 10
    /**
     * users total
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    total: number = 0

    @observable
    filters: IUserStore.SearchParams = {}

    /**
     * 加载用户列表
     *
     * @memberof UserStore
     */

    @action
    getUsers = async () => {
        this.getUsersloading = true
        try {
            const res = await this.api.user.getUsers({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.users = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.users = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getUsersloading = false
        })
    }

    createUser = async (user: IUserStore.IUser) => {
        const res = await this.api.user.createUser(user)
        this.changepage(1)
        return res
    }

    @action
    modifyUser = async (user: IUserStore.IUser) => {
        const { id, role, status, pwd, department } = user
        return await this.api.user.modifyUser({ id, role, status, pwd, department })
    }

    deleteUser = async (id: number) => {
        const res = await this.api.user.deleteUser({ id })
        this.getUsers()
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getUsers()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getUsers()
    }

    @action
    changeFilter = (data: IUserStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setUser = (user: IUserStore.IUser) => {
        this.user = user
    }
    @action
    clearUser = () => {
        this.user = undefined
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

export default new UserStore()
