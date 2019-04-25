
import http from '@services/http'
const basePath = '/api/config/'
export default {
  getConfigs(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createConfig(data): Promise<any> {
    return http.post(`${basePath}addConfig`, data || {})
  },

  modifyConfig(data): Promise<any> {
    return http.post(`${basePath}editConfig`, data || {})
  },

  deleteConfig(data): Promise<any> {
    return http.post(`${basePath}delInfo`, data || {})
  },

  allTemplateDetail(data): Promise<any> {
    return http.post(`${basePath}configField`, data)
  },

  getConfig(data): Promise<any> {
    return http.post(`${basePath}configInfo`, data)
  },

  pidFieldInfo(data): Promise<any> {
    return http.post(`${basePath}pidFieldInfo`, data)
  },

  fullConfig(): Promise<any> {
    return http.post(`${basePath}appConfigList`)
  },
}