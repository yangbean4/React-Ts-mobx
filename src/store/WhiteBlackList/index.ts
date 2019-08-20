import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'


export class WhiteBlackListStore extends StoreExt {
  /**
   * 加载列表时的loading
   *
   * @type {boolean}
   * @memberof WhiteBlackListStore
   */
  @observable
  getListLoading: boolean = false
  /**
   * 列表
   *
   * @type {IWhiteBlackListStore.Iitem[]}
   * @memberof WhiteBlackListStore
   */
  @observable
  list: IWhiteBlackListStore.IitemForList[] = []

  @observable
  item: IWhiteBlackListStore.Iitem = {}

  @observable
  sceneImageConfig: any[] = null

  /**
   * table page
   *
   * @type {number}
   * @memberof WhiteBlackListStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof WhiteBlackListStore
   */
  @observable
  pageSize: number = 10
  /**
   * appGroupList total
   *
   * @type {number}
   * @memberof WhiteBlackListStore
   */
  @observable
  total: number = 0

  @observable
  filters: IWhiteBlackListStore.SearchParams = {}

  @observable
  optionListDb: IWhiteBlackListStore.OptionListDb = {
    PkgnameData: [],
    Category: []
  }

  @action
  getCategory = async () => {
    const res = await this.api.whiteBlack.getCategory()
    runInAction('SET', () => {
      this.optionListDb.Category = res.data;
    })
  }

  @action
  getPkgname = async () => {
    const [all, disableList] = await Promise.all([
      this.api.appGroup.getPkgnameData(),
      this.api.whiteBlack.getDisablePkgName()
    ])
    const map = {};
    Object.values(disableList.data).forEach((k: number) => {
      map[k] = true
    })
    runInAction('SET', () => {
      this.optionListDb.PkgnameData = all.data.map(item => {
        item.disabled = map[item.id] || false
        return item
      });
    })
  }

  @action
  clearItem = () => {
    this.item = {}
  }

  /**
   * 加载列表
   *
   * @memberof WhiteBlackListStore
   */

  @action
  getList = async () => {
    this.getListLoading = true
    try {
      const res = await this.api.whiteBlack.getList({ page: this.page, pageSize: this.pageSize, ...this.filters })
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
  create = async (item: IWhiteBlackListStore.Iitem) => {
    return await this.api.whiteBlack.create(item);
  }

  /**
   * 更新
   */
  update = async (item: IWhiteBlackListStore.Iitem) => {
    return await this.api.whiteBlack.edit(item);
  }
  /**
   * 获取
   */
  getItem = async (item: IWhiteBlackListStore.Iitem) => {
    try {
      const res = await this.api.whiteBlack.get(item);
      runInAction('GET_ITEM', () => {
        this.item = res.data
      })
    } catch (e) {
      console.error(e)
    }
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
  changeFilter = (data: IWhiteBlackListStore.SearchParams) => {
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

export default new WhiteBlackListStore()
