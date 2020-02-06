/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-24 09:57:07
 * @LastEditors  :  bean^ <bean_4@163.com>
 * @LastEditTime : 2020-02-06 16:52:32
 */

import http from '@services/http'
const basePath = '/api/appsManage/'
export default {
  getAppsManage(data, config = {}): Promise<any> {
    return http.post(`${basePath}detail`, data || {}, config)
  },

  createAppsManage(data): Promise<any> {
    return http.post(`${basePath}addApp`, data || {})
  },

  modifyAppsManage(data): Promise<any> {
    return http.post(`${basePath}editApp`, data || {})
  },

  modifyAppsManageInfo(data): Promise<any> {
    return http.post(`${basePath}info`, data || {})
  },
  senAppList(data): Promise<any> {
    return http.post(`${basePath}senAppList`, data)
  },

  checkAppsStatus(data): Promise<any> {
    return http.post(`${basePath}checkApp`, data, { useRes: true })
  },

  showGrabMessage(data): Promise<any> {
    return http.post(`${basePath}grabMessage`, data)
  },

  /**
   * 获取IOS/Android信息
   */
  getAppInfo(data): Promise<any> {
    return http.post(`${basePath}grapAppInfo`, data)
  },
  getUserList(): Promise<any> {
    return http.post(`api/user/userList`)
  },
}
