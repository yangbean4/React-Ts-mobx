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
     * 类型
     */
    @observable
    companyType: string
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

    @action
    /**
     * 设置类型
     */
    setCompanyType = (companyType: string) => {
        this.companyType = companyType
        this.changeFilter({})
        this.pageSize = 10
    }
    /**
     * 加载公司列表
     */
    @action
    getCompanys = async () => {
        this.getCompanyloading = true
        try {
            let param
            let data = { page: this.page, pageSize: this.pageSize, ...this.filters }
            this.companyType === 'source' && (param = { ...data, type: 0 })
            this.companyType === 'subsite' && (param = { ...data, type: 1 })
            const res = await this.api.company.getCompanys(param)
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
        const res = await this.api.company.createCompany(company)
        return res
    }

    modifyCompany = async (company: ICompanyStore.ICompany) => {
        const res = await this.api.company.modifyCompany(company)
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