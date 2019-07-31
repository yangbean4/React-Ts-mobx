import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'

export class OfferQueryStore extends StoreExt {
  @observable
  getOfferQueryLoading: boolean = false

  @observable
  offerList: IOfferQueryStore.IQuery[] = []

  @observable
  page: number = 1

  @observable
  pageSize: number = 10

  @observable
  total: number = 0

  @observable
  filters: IOfferQueryStore.SearchParams = {}

  @observable
  optionListDb: IOfferQueryStore.OptionListDb = {
    geo: [],
    account_id: []
  }

  /**
   * 加载列表
   */
  @action
  getOfferQuerys = async () => {
    this.getOfferQueryLoading = true
    try {
      const res = await this.api.offerQuery.getOfferList({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_REVENUE', () => {
        this.offerList = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_REVENUE', () => {
        this.offerList = []
        this.total = 0
      })
    }
    runInAction('HIDE_LOADING', () => {
      this.getOfferQueryLoading = false
    })
  }

  @action
  getGeoList = async () => {
    const res = await this.api.appGroup.getCountry()
    runInAction('SET_GEOLIST', () => {
      this.optionListDb.geo = res.data
    })
  }

  @action
  getAccountList = async () => {
    const res = await this.api.appGroup.getAccountSource()
    runInAction('SET_GEOLIST', () => {
      this.optionListDb.account_id = res.data
    })
  }

  @action
  changeFilter = (data: IOfferQueryStore.SearchParams) => {
    this.filters = data
    this.changePage(1)
  }

  @action
  changePage = (page: number) => {
    this.page = page
    this.getOfferQuerys()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getOfferQuerys()
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

export default new OfferQueryStore()
