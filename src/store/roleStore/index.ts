import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class RoleStore extends StoreExt {
  /**
   * 加载用户列表时的loading
   *
   * @type {boolean}
   * @memberof RoleStore
   */
  @observable
  getRolesloading: boolean = false
  /**
   * 用户列表
   *
   * @type {IRoleStore.IRole[]}
   * @memberof RoleStore
   */
  @observable
  roles: IRoleStore.IRole[] = []

  @observable
  role: IRoleStore.IRole

  @observable
  allRole: IRoleStore.RoleOption[] = []
  /**
   * table page
   *
   * @type {number}
   * @memberof RoleStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof RoleStore
   */
  @observable
  pageSize: number = 10
  /**
   * roles total
   *
   * @type {number}
   * @memberof RoleStore
   */
  @observable
  total: number = 0

  @observable
  filters: IRoleStore.SearchParams = {}


  /**
   * 加载用户列表
   *
   * @memberof RoleStore
   */

  @action
  getRoles = async () => {
    this.getRolesloading = true
    try {
      const res = await this.api.role.getRoles({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_role_LIST', () => {
        this.roles = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_role_LIST', () => {
        this.roles = []
        this.total = 0
      })
    }
    runInAction('HIDE_role_LIST_LOADING', () => {
      this.getRolesloading = false
    })
  }

  @action
  clearRolesAll = () => {
    this.allRole = []
  }
  @action
  getAllRoles = async () => {
    try {
      this.clearRolesAll()
      const res = await this.api.role.fullRole()
      runInAction('aet_all_roleList', () => {
        this.allRole = res.data
      })
    } catch (err) { }
  }

  @action
  initEditRule = async (data) => {
    let role = {}
    try {
      const res = await this.api.role.getRole(data)
      role = {
        ...data,
        ...res.data
      }
    } catch (err) { }
    runInAction('set_edit_role', () => {
      this.role = role
    })
  }
  @action
  clearEditRole = () => {
    this.role = {}
  }
  createRole = async (role: IRoleStore.IRole) => {
    return await this.api.role.createRole(role)
  }

  modifyRole = async (role: IRoleStore.IRole) => {
    return await this.api.role.modifyRole(role)
  }

  deleteRole = async (id: number) => {
    const res = await this.api.role.deleteRole({ id })
    this.getRoles()
    return res
  }

  @action
  changepage = (page: number) => {
    this.page = page
    this.getRoles()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getRoles()
  }

  @action
  changeFilter = (data: IRoleStore.SearchParams) => {
    this.filters = data
    this.changepage(1)
  }

  @action
  setRole = (role: IRoleStore.IRole) => {
    this.role = role
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

export default new RoleStore()
