import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class CreativeFrequencyStore extends StoreExt {
  /**
   * 加载列表时的loading
   *
   * @type {boolean}
   * @memberof CreativeFrequencyStore
   */
  @observable
  getListLoading: boolean = false
  /**
   * 数据列表
   *
   * @type {ICreativeFrequencyStore.IitemForList[]}
   * @memberof CreativeFrequencyStore
   */
  @observable
  list: ICreativeFrequencyStore.IitemForList[] = []

  @observable
  item: ICreativeFrequencyStore.IitemForList = {}
  /**
   * table page
   *
   * @type {number}
   * @memberof CreativeFrequencyStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof CreativeFrequencyStore
   */
  @observable
  pageSize: number = 10
  /**
   * list total
   *
   * @type {number}
   * @memberof CreativeFrequencyStore
   */
  @observable
  total: number = 0

  @observable
  filters: ICreativeFrequencyStore.SearchParams = {}

  @observable
  optionListDb: ICreativeFrequencyStore.OptionListDb = {
    creatives: [],
    pkgnames: []
  }

  @action
  setItem = (item: ICreativeFrequencyStore.IitemForList) => {
    this.item = item;
  }


  @action
  getCreativeList = async () => {
    const res = await this.api.creativeFrequency.getCreatives();
    runInAction('SET', () => {
      this.optionListDb.creatives = res.data;
    })
  }

  @action
  getPkgNameList = async () => {
    const res = await this.api.appGroup.getPkgnameData();
    runInAction('SET', () => {
      this.optionListDb.pkgnames = res.data;
    })
  }


  deleteFrequency = async (id: number) => {
    const res = await this.api.creativeFrequency.delete({ id });
    if (res.errorcode == 0) {
      this.$message.success(res.message);
      this.getList();
    }
  }


  /**
   * 加载列表
   *
   * @memberof CreativeFrequencyStore
   */
  @action
  getList = async () => {
    this.getListLoading = true
    try {
      const res = await this.api.creativeFrequency.getList({ page: this.page, pageSize: this.pageSize, ...this.filters })
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
  changeFilter = (data: ICreativeFrequencyStore.SearchParams) => {
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

export default new CreativeFrequencyStore()
