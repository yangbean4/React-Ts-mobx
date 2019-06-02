import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class AccountStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof AccountStore
     */
    @observable
    getAccountLoading: boolean = false

    @observable
    accountType: string
    /**
     * 用户列表
     *
     * @type {IAccountStore.IAccount[]}
     * @memberof AccountStore
     */
    @observable
    accounts: IAccountStore.IAccount[] = []

    @observable
    account: IAccountStore.IAccount
    /**
     * table page
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    pageSize: number = 10
    /**
     * accounts total
     *
     * @type {number}
     * @memberof AccountStore
     */
    @observable
    total: number = 0

    @observable
    filters: IAccountStore.SearchParams = {}

    @action
    setAccountType = (accountType: string) => {
        this.accountType = accountType
        this.changeFilter({})
    }

    /**
     * 加载用户列表
     *
     * @memberof AccountStore
     */

    @action
    getAccounts = async () => {
        this.getAccountLoading = true
        try {
            let data = {
                page: this.page, pageSize: this.pageSize, ...this.filters,
                type: this.accountType === 'source' ? 1 : 2
            }
            const res = await this.api.account.getAccounts(data)
            runInAction('SET_USER_LIST', () => {
                this.accounts = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.accounts = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getAccountLoading = false
        })
    }

    createAccount = async (account: IAccountStore.IAccount) => {
        const res = await this.api.account.createAccount(account)
        this.changepage(1)
        return res
    }

    @action
    modifyAccount = async (account: IAccountStore.IAccount) => {
        const res = await this.api.account.modifyAccount(account)
        this.changepage(1)
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getAccounts()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getAccounts()
    }

    @action
    changeFilter = (data: IAccountStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setAccount = (account: IAccountStore.IAccount) => {
        this.account = account
    }
    @action
    clearAccount = () => {
        this.account = undefined
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

export default new AccountStore()
