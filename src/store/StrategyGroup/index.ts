import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'


export class StrategyGroupStore extends StoreExt {
  /**
   * 加载列表时的loading
   *
   * @type {boolean}
   * @memberof StrategyGroupStore
   */
  @observable
  getListLoading: boolean = false
  /**
   * 列表
   *
   * @type {IStrategyGroupStore.Iitem[]}
   * @memberof StrategyGroupStore
   */
  @observable
  list: IStrategyGroupStore.IitemForList[] = []


  /**
   * table page
   *
   * @type {number}
   * @memberof StrategyGroupStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof StrategyGroupStore
   */
  @observable
  pageSize: number = 10
  /**
   *  total
   *
   * @type {number}
   * @memberof StrategyGroupStore
   */
  @observable
  total: number = 0

  @observable
  filters: IStrategyGroupStore.SearchParams = {}


  /**
   * 加载列表
   *
   * @memberof StrategyGroupStore
   */

  @action
  getList = async () => {
    this.getListLoading = true
    try {
      const res = await this.api.strategyGroup.getList({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_TASK_LIST', () => {
        this.list = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_TASK_LIST', () => {
        this.list = []
        this.total = 0
      })
    }
    runInAction('HIDE_TASK_LIST_LOADING', () => {
      this.getListLoading = false
    })
  }

  /**
   * 创建
   */
  create = async (item) => {
    return await this.api.strategyGroup.create(item);
  }


  @action
  changepage = (page: number) => {
    this.page = page
    this.getList()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getList()
  }

  @action
  changeFilter = (data: IStrategyGroupStore.SearchParams) => {
    this.filters = data
    this.changepage(1)
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

export default new StrategyGroupStore()
