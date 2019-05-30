import { observable, action, runInAction } from "mobx"
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'


export class CompanyStore extends StoreExt {
    /**
     * 加载公司列表时的loading
     * 
     */
    @observable
    getCompanyloading: boolean = false
    /**
     * 公司列表
     */
    @observable
    companys: ICompanyStore.ICompany[] = []

    @observable
    company: ICompanyStore.ICompany

    /**
     * table page
     * @type {number}
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     */
    @observable
    pageSize: number = 10
    /**
     * user total
     * 
     */
    @observable
    total: number = 0

    @observable
    filters: ICompanyStore.SearchParams = {}

    /**
     * 加载公司列表
     */
    @action
    getCompanys = async () => {
        this.getCompanyloading = true
        try {
            const res = await this.api.user.getUsers({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_COMPANY_LIST', () => {
                this.companys = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_COMPANY_LIST', () => {
                this.companys = []
                this.total = 0
            })
        }
        runInAction('HIDE_COMPANY_LIST_LOADING', () => {
            this.getCompanyloading = false
        })
    }
    createCompany = async (company: ICompanyStore.ICompany) => {
        const res = await this.api.user.createUser(company)
        return res
    }
    @action
    modifyCompany = async (company: ICompanyStore.ICompany) => {
        // const { id, role, status, pwd } = company
        // return await this.api.user.modifyUser({ id, role, status, pwd })
    }

    deleteCompany = async (id: number) => {
        const res = await this.api.user.deleteUser({ id })
        this.getCompanys()
        return res
    }

    @action
    changePage = (page: number) => {
        this.page = page
        this.getCompanys()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCompanys()
    }

    @action
    changeFilter = (data: ICompanyStore.SearchParams) => {
        this.filters = data
        this.changePage(1)
    }

    @action
    setCompany = (company: ICompanyStore.ICompany) => {
        this.company = company
    }
    @action
    clearCompany = () => {
        this.company = undefined
    }

    handleTableChange = (pagination: PaginationConfig) => {
        const { current, pageSize } = pagination
        if (current !== this.page) {
            this.changePage(current)
        }
        if (pageSize !== this.pageSize) {
            this.changePageSize(pageSize)
        }
    }
}
export default new CompanyStore()