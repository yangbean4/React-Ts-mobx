import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class CurrencyStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof CurrencyStore
     */
    @observable
    getCurrencyLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {ICurrencyStore.ICurrency[]}
     * @memberof CurrencyStore
     */
    @observable
    currencyList: ICurrencyStore.ICurrencyForList[] = []

    @observable
    currency: ICurrencyStore.ICurrency
    /**
     * table page
     *
     * @type {number}
     * @memberof CurrencyStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof CurrencyStore
     */
    @observable
    pageSize: number = 10
    /**
     * currencyList total
     *
     * @type {number}
     * @memberof CurrencyStore
     */
    @observable
    total: number = 0

    @observable
    filters: ICurrencyStore.SearchParams = {}

    /**
     * 加载用户列表
     *
     * @memberof CurrencyStore
     */

    @action
    getCurrency = async () => {
        this.getCurrencyLoading = true
        try {
            const res = await this.api.currency.getCurrency({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.currencyList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.currencyList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getCurrencyLoading = false
        })
    }

    createCurrency = async (currency: ICurrencyStore.ICurrency) => {
        const res = await this.api.currency.createCurrency(currency)
        this.changepage(1)
        return res
    }

    @action
    modifyCurrency = async (currency: ICurrencyStore.ICurrency) => {
        // const { id, role, status, pwd } = currency
        // return await this.api.currency.modifyCurrency({ id, role, status, pwd })
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getCurrency()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCurrency()
    }

    @action
    changeFilter = (data: ICurrencyStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setCurrency = (currency: ICurrencyStore.ICurrency) => {
        this.currency = currency
    }
    @action
    clearCurrency = () => {
        this.currency = undefined
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

export default new CurrencyStore()
