
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
  checkConfig(data): Promise<any> {
    return http.post(`${basePath}checkConfig`, data)
  },

  editBasic1(data): Promise<any> {
    return http.post(`${basePath}editBasic1`, data)
  },
  editBasic2(data): Promise<any> {
    return http.post(`${basePath}editBasic2`, data)
  },
  editPOP(data): Promise<any> {
    return http.post(`${basePath}editPop`, data)
  },
  editPID(data): Promise<any> {
    return http.post(`${basePath}editPid`, data)
  },

  allTemplateInfo(): Promise<any> {
    return http.post(`${basePath}template/allTemplateInfo`)
  },
}
