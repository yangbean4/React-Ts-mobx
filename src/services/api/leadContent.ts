
import http from '@services/http'
const basePath = '/api/creative/'
export default {

  getAppsManage(data): Promise<any> {
    return http.post(`${basePath}appListLeadContent`, data || {})
  },

  getLeadContent(data): Promise<any> {
    return http.post(`${basePath}leadContentList`, data || {})
  },

  createLeadContent(data): Promise<any> {
    return http.post(`${basePath}addLeadContent`, data || {})
  },

  modifyLeadContent(data): Promise<any> {
    return http.post(`${basePath}editLeadContent`, data || {})
  },

  getappIds(): Promise<any> {
    return http.post(`/api/endcard/appIds`)
  },

  getlanguage(): Promise<any> {
    return http.post(`/api/endcard/language`)
  },

  uploadLeadContent(data): Promise<any> {
    return http.post(`/api/upload/uploadLeadContent`, data)
  },
}
