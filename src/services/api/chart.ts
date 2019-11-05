/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-11-01 15:16:27
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-01 15:42:35
 */

import http from '@services/http'
const basePath = '/api/dubbleChart/'
export default {
  getData(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },
  getStrategyList(data?): Promise<any> {
    return http.post(`${basePath}strategyList`, data)
  },
  getEcpm(): Promise<any> {
    return http.post(`${basePath}placementEcpm`)
  }
}
