
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
  }

}
