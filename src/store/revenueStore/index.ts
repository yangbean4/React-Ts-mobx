import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'

export class RevenueStore extends StoreExt {
  @observable
  getRevenueLoading: boolean = false

  @observable
  RevenueList: IRevenueStore.IRevenue[] = []

  @observable
  page: number = 1

  @observable
  pageSize: number = 10

  @observable
  total: number = 0

  @observable
  filters: IRevenueStore.SearchParams = {}

  /**
   * 加载列表
   */
  @action
  getRevenues = async () => {
    this.getRevenueLoading = true
    try {
      const res = await this.api.revenue.getRevenueList({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_REVENUE', () => {
        this.RevenueList = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_REVENUE', () => {
        this.RevenueList = []
        this.total = 0
      })
    }
    runInAction('HIDE_LOADING', () => {
      this.getRevenueLoading = false
    })
  }

  @action
  uploadExel = async () => {

  }

  @action
  changeFilter = (data: IRevenueStore.SearchParams) => {
    this.filters = data
    this.changePage(1)
  }

  @action
  changePage = (page: number) => {
    this.page = page
    this.getRevenues()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getRevenues()
  }

  @action
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

export default new RevenueStore()
