
import http from '@services/http'
const basePath = '/api/creativeFrequency/'
export default {
  /**
   * 获取列表
   */
  getList(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  delete(data): Promise<any> {
    return http.post(`${basePath}del`, data)
  },

  getCreatives(): Promise<any> {
    return http.post('api/creative/creatives')
  },

  create(data): Promise<any> {
    return http.post(`${basePath}add`, data)
  },

  edit(data): Promise<any> {
    return http.post(`${basePath}edit`, data)
  }
}
