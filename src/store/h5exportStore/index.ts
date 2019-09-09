import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class H5ExportStore extends StoreExt {
  /**
   * 加载列表时的loading
   *
   * @type {boolean}
   * @memberof H5ExportStore
   */
  @observable
  getListLoading: boolean = false
  /**
   * 数据列表
   *
   * @type {IH5ExportStore.IitemForList[]}
   * @memberof H5ExportStore
   */
  @observable
  list: IH5ExportStore.IitemForList[] = []

  @observable
  item: IH5ExportStore.IitemForList = {}
  /**
   * table page
   *
   * @type {number}
   * @memberof H5ExportStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof H5ExportStore
   */
  @observable
  pageSize: number = 10
  /**
   * list total
   *
   * @type {number}
   * @memberof H5ExportStore
   */
  @observable
  total: number = 0

  @observable
  filters: IH5ExportStore.SearchParams = {}

  @observable
  optionListDb: IH5ExportStore.OptionListDb = {
    chooseList: {},
    subsiteInfo: []
  }

  @action
  getChooseList = async () => {
    const res = await this.api.h5Export.getChooseList()
    runInAction('SET', () => {
      this.optionListDb.chooseList = res.data;
    })
  }

  @action
  getSubsiteInfo = async () => {
    const res = await this.api.h5Export.getSubsiteInfo()
    runInAction('SET', () => {
      this.optionListDb.subsiteInfo = res.data;
    })
  }

  @action
  clearCache = () => {
    let target = {}
    Object.keys(this.optionListDb).forEach(key => target[key] = [])
    runInAction('CLEAR', () => {
      // this.optionListDb = target
    })
  }


  /**
   * 加载列表
   *
   * @memberof H5ExportStore
   */
  @action
  getList = async () => {
    this.getListLoading = true
    try {
      const res = await this.api.h5Export.getList({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_USER_LIST', () => {
        this.list = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_USER_LIST', () => {
        this.list = []
        this.total = 0
      })
    }
    runInAction('HIDE_USER_LIST_LOADING', () => {
      this.getListLoading = false
    })
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
  changeFilter = (data: IH5ExportStore.SearchParams) => {
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

export default new H5ExportStore()
