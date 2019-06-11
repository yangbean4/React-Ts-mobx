
import http from '@services/http'
const basePath = '/api/appsManage/'
export default {
  getAppsManage(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createAppsManage(data): Promise<any> {
    return http.post(`${basePath}addApp`, data || {})
  },

  modifyAppsManage(data): Promise<any> {
    return http.post(`${basePath}editApp`, data || {})
  },

  // deleteAppsManage(data): Promise<any> {
  //   return http.post(`${basePath}delAppsManage`, data || {})
  // },

  // fullAppsManage(): Promise<any> {
  //   return http.post(`${basePath}appList`)
  // },

  senAppList(data): Promise<any> {
    return http.post(`${basePath}senAppList`, data)
  },

}
