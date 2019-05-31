
import http from '@services/http'
const basePath = '/api/app/'
export default {
  getAppGroup(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createAppGroup(data): Promise<any> {
    return http.post(`${basePath}addVirtualAppGroup`, data || {})
  },

  modifyAppGroup(data): Promise<any> {
    return http.post(`${basePath}editVirtualAppGroup`, data || {})
  },

  // deleteAppGroup(data): Promise<any> {
  //   return http.post(`${basePath}delAppGroup`, data || {})
  // },

  fullAppGroup(): Promise<any> {
    return http.post(`${basePath}appList`)
  },

  getAppGroupInfo(data): Promise<any> {
    return http.post(`${basePath}detail`, data)
  },
}
