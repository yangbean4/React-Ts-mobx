
import http from '@services/http'
const basePath = '/api/endcard/'
export default {

  getAppsManage(data): Promise<any> {
    return http.post(`${basePath}appList`, data || {})
  },

  getEndcard(data): Promise<any> {
    return http.post(`${basePath}endcardList`, data || {})
  },

  createEndcard(data): Promise<any> {
    return http.post(`${basePath}addEndcard`, data || {})
  },

  modifyEndcard(data): Promise<any> {
    return http.post(`${basePath}editEndcard`, data || {})
  },

  copyEndcard(data): Promise<any> {
    return http.post(`${basePath}duplicateEndcard`, data || {})
  },

  getEndcardInfo(data): Promise<any> {
    return http.post(`${basePath}endcardDetail`, data)
  },

  // 
  getappIds(): Promise<any> {
    return http.post(`${basePath}appIds`)
  },
  getlanguage(): Promise<any> {
    return http.post(`${basePath}language`)
  },
  getendcards(): Promise<any> {
    return http.post(`${basePath}endcards`)
  },
  gettemplate(): Promise<any> {
    return http.post(`${basePath}template`)
  },
}
