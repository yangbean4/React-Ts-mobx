
import http from '@services/http'
const basePath = '/api/whiteBlack/'
export default {
  /**
   * 获取列表
   */
  getList(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  /**
   * 获取category 分类
   */
  getCategory(): Promise<any> {
    return http.post(`${basePath}categoryInfo`)
  },

  /**
   * 添加White/Black配置信息
   */
  create(data): Promise<any> {
    return http.post(`${basePath}add`, data || {})
  },

  /**
   * 获取white/Black详情
   */
  get(data): Promise<any> {
    return http.post(`${basePath}info`, data || {})
  },

  /**
   * 编辑White/Black配置信息
   */
  edit(data): Promise<any> {
    return http.post(`${basePath}edit`, data || {})
  },

  /**
   * 获取已设置的pkg_name列表
   */
  getDisablePkgName(): Promise<any> {
    return http.post(`${basePath}appList`)
  }
}
