import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class PermissionStore extends StoreExt {
  /**
   * 加载用户列表时的loading
   *
   * @type {boolean}
   * @memberof PermissionStore
   */
  @observable
  getPermissionsloading: boolean = false
  /**
   * 用户列表
   *
   * @type {IPermissionStore.IPermission[]}
   * @memberof PermissionStore
   */
  @observable
  permissions: IPermissionStore.IPermission[] = []

  @observable
  permission: IPermissionStore.IPermission

  /**
   * table page
   *
   * @type {number}
   * @memberof PermissionStore
   */
  @observable
  page: number = 1
  /**
   * table pageSize
   *
   * @type {number}
   * @memberof PermissionStore
   */
  @observable
  pageSize: number = 10
  /**
   * permissions total
   *
   * @type {number}
   * @memberof PermissionStore
   */
  @observable
  total: number = 0

  @observable
  filters: IPermissionStore.SearchParams = {}

  @observable
  permissionTree: IPermissionStore.IPermissionTree[]

  /**
   * 加载用户列表
   *
   * @memberof PermissionStore
   */

  @action
  getPermissions = async () => {
    this.getPermissionsloading = true
    try {
      const res = await this.api.permission.getPermissions({ page: this.page, pageSize: this.pageSize, ...this.filters })
      runInAction('SET_permission_LIST', () => {
        this.permissions = res.data
        this.total = res.total
      })
    } catch (err) {
      runInAction('SET_permission_LIST', () => {
        this.permissions = []
        this.total = 0
      })
    }
    runInAction('HIDE_permission_LIST_LOADING', () => {
      this.getPermissionsloading = false
    })
  }
  @action
  getPermissionTree = async () => {
    try {
      this.clearPermissionTree()
      const res = await this.api.permission.getPermissionTree()
      runInAction('set_permissionTree', () => {
        this.permissionTree = res.data
      })
    } catch (err) { }
  }
  @action
  clearPermissionTree = () => {
    this.permissionTree = []
  }

  // @action
  // initEditRule = async (data) => {
  //   try {
  //     this.permission = {}
  //     const res = await this.api.permission.getPermission(data)
  //     runInAction('set_edit_permission', () => {
  //       this.permission = res.data
  //     })
  //   } catch (err) { }
  // }

  @action
  clearEditPermission = () => {
    this.permission = {}
  }
  createPermission = async (permission: IPermissionStore.IPermission) => {
    return await this.api.permission.createPermission(permission)
  }

  modifyPermission = async (permission: IPermissionStore.IPermission) => {
    return await this.api.permission.modifyPermission(permission)
  }

  deletePermission = async (id: number) => {
    const res = await this.api.permission.deletePermission({ id })
    this.getPermissions()
    return res
  }

  @action
  changepage = (page: number) => {
    this.page = page
    this.getPermissions()
  }

  @action
  changePageSize = (pageSize: number) => {
    this.pageSize = pageSize
    this.getPermissions()
  }

  @action
  changeFilter = (data: IPermissionStore.SearchParams) => {
    this.filters = data
    this.changepage(1)
  }

  @action
  setPermission = (permission: IPermissionStore.IPermission) => {
    this.permission = permission
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

export default new PermissionStore()
