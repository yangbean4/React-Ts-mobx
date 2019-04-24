
import http from '@services/http'
const basePath = '/api/template/'
export default {
  getCustoms(data): Promise<any> {
    return http.post(`${basePath}allTemplate`, data || {})
  },

  createCustom(data): Promise<any> {
    return http.post(`${basePath}addTemplate`, data || {})
  },

  modifyCustom(data): Promise<any> {
    return http.post(`${basePath}editTemplate`, data || {})
  },

  deleteCustom(data): Promise<any> {
    return http.post(`${basePath}delTemplate`, data || {})
  },

  fullTemplate(): Promise<any> {
    return http.post(`${basePath}fullTemplate`)
  }
}
