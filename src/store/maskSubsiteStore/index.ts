/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-12-03 09:56:50
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-03 15:22:27
 */
import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class MaskSubsiteStore extends StoreExt {

  @observable
  getMaskLoading: boolean = false

  @observable
  maskList: IMaskSubsiteStore.IMask[] = []

  @observable
  page: number = 1

  @observable
  pageSize: number = 10

  @observable
  total: number = 0

  @observable
  optionListDb: IMaskSubsiteStore.OptionListDb = {
    appIdData: [],
    pkgNameData: [],
    usedMask: {}
  }

  @observable
  filters: IMaskSubsiteStore.SearchParams = {}

  @action
  getOptionListDb = async () => {
    const keys = Object.keys(this.optionListDb)
    const promiseAll = keys.map(key => this.api.mask[`get${key}`](
    ))
    Promise.all(promiseAll).then(data => {
      const target = {}
      keys.forEach((key, index) => {
        target[key] = data[index].data
      })
      runInAction('SET', () => {
        this.optionListDb = target
      })
    })
  }

  @action
  getUsedMask = () => {
    this.api.mask.getusedMask({}).then(res => runInAction('SET', () => {
      this.optionListDb.usedMask = res.data;
    }));
  }

  @action
  getMasks = async () => {
    this.getMaskLoading = true
    try {
      const res = await this.api.mask.getMasks({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_USER_LIST', () => {
        this.maskList = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_USER_LIST', () => {
        this.maskList = []
        this.total = 0
      })
    }
    runInAction('HIDE_USER_LIST_LOADING', () => {
      this.getMaskLoading = false
    })
  }

  createMask = async (mask: IMaskSubsiteStore.IMask) => {
    const res = await this.api.mask.createMask(mask)
    this.changepage(1)
    return res
  }

  @action
  modifyMask = async (mask: IMaskSubsiteStore.IMask) => {
    const res = await this.api.mask.modifyMask(mask)
    this.changepage(1)
    return res
  }

  deleteMask = async (id: number | string) => {
    const res = await this.api.mask.deleteMask({ id })
    this.getMasks()
    return res
  }

  @action
  changepage = (page: number) => {
    this.page = page
    this.getMasks()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getMasks()
  }

  @action
  changeFilter = (data: IMaskSubsiteStore.SearchParams) => {
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

export default new MaskSubsiteStore()
