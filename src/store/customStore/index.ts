import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class CustomStore extends StoreExt {
  /**
   * 加载用户列表时的loading
   *
   * @type {boolean}
   * @memberof CustomStore
   */
  @observable
  getCustomsloading: boolean = false
  /**
   * 用户列表
   *
   * @type {ICustomStore.ICustom[]}
   * @memberof CustomStore
   */
  @observable
  customs: ICustomStore.ICustom[] = []

  @observable
  templateTree: ICustomStore.ICustomTree[] = []

  /**
   * table page
   *
   * @type {number}
   * @memberof CustomStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof CustomStore
   */
  @observable
  pageSize: number = 10
  /**
   * customs total
   *
   * @type {number}
   * @memberof CustomStore
   */
  @observable
  total: number = 0

  @observable
  filters: ICustomStore.SearchParams = {}


  /**
   * 加载用户列表
   *
   * @memberof CustomStore
   */

  @action
  getCustoms = async () => {
    this.getCustomsloading = true
    try {
      const res = await this.api.custom.getCustoms({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_custom_LIST', () => {
        this.customs = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_custom_LIST', () => {
        this.customs = []
        this.total = 0
      })
    }
    runInAction('HIDE_custom_LIST_LOADING', () => {
      this.getCustomsloading = false
    })
  }

  @action
  fullTemplate = async () => {
    if (this.templateTree.length) {
      return
    }
    let data = []
    try {
      const res = await this.api.custom.fullTemplate()
      data = res.data
    } catch (error) {

    }
    runInAction('SET_TEMP_TREE', () => {
      this.templateTree = data
    })

  }

  createCustom = async (custom: ICustomStore.ICustom) => {
    return await this.api.custom.createCustom(custom)
  }

  modifyCustom = async (custom: ICustomStore.ICustom) => {
    return await this.api.custom.modifyCustom(custom)
  }

  deleteCustom = async (id: number) => {
    const res = await this.api.custom.deleteCustom({ id })
    this.getCustoms()
    return res
  }

  @action
  changepage = (page: number) => {
    this.page = page
    this.getCustoms()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getCustoms()
  }

  @action
  changeFilter = (data: ICustomStore.SearchParams) => {
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

export default new CustomStore()
