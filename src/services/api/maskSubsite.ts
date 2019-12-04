/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-12-03 10:16:31
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-03 18:32:29
 */

import http from '../http'
const basePath = 'api/maskSubsite/'
export default {
  getMasks(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createMask(data): Promise<any> {
    return http.post(`${basePath}add`, data || {})
  },

  modifyMask(data): Promise<any> {
    return http.post(`${basePath}edit`, data || {})
  },

  deleteMask(data): Promise<any> {
    return http.post(`${basePath}del`, data || {})
  },
  getappIdData(data): Promise<any> {
    return http.post(`api/appsManage/senAppOnlineList`, data || {})
  },

  getpkgNameData(data): Promise<any> {
    return http.post(`api/app/pkgnameData`, data || {})
  },
}
