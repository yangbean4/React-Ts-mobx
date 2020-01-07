
import http from '@services/http'
const basePath = 'api/loadVideo/'
export default {
  /**
   * 获取loadvideo2 汇总列表数据
   */
  getCollectList(data): Promise<any> {
    return http.post(`${basePath}collectList`, data)
  },
  /**
   * 获取loadvideo2 详细列表数据
   */
  getDetail(data): Promise<any> {
    return http.post(`${basePath}detail`, data)
  },
  /**
   * 新增
   */
  add(data): Promise<any> {
    return http.post(`${basePath}add`, data)
  },
  /**
   * 编辑
   */
  edit(data): Promise<any> {
    return http.post(`${basePath}edit`, data)
  },
  /**
   * 删除
   */
  delete(data): Promise<any> {
    return http.post(`${basePath}del`, data)
  }
}
