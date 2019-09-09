
import http from '@services/http'
const basePath = '/api/export/'
export default {
  /**
   * 获取列表
   */
  getList(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  /**
   * 获取offer/appid/campaing对应数据
   */
  getChooseList(): Promise<any> {
    return http.post(`${basePath}chooseList`)
  },

  /**
   * 获取subsite/pid对应数据
   */
  getSubsiteInfo(): Promise<any> {
    return http.post(`${basePath}subsiteInfo`)
  },

  /**
   * 增加H5导出模板
   */
  create(data): Promise<any> {
    return http.post(`${basePath}add`, data)
  }
}
