
import http from '@services/http'
const basePath = '/api/strategy/'
export default {
  /**
   * 获取列表
   */
  getList(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  /**
   * 添加分类
   */
  create(data): Promise<any> {
    return http.post(`${basePath}add`, data || {})
  }
}

