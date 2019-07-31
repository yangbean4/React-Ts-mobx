
import http from '@services/http'
const basePath = '/api/templateDetail/'
export default {
  getTemplates(data): Promise<any> {
    return http.post(`${basePath}allTemplateDetail`, data || {})
  },

  createTemplate(data): Promise<any> {
    return http.post(`${basePath}addTemplateDetail`, data || {})
  },

  modifyTemplate(data): Promise<any> {
    return http.post(`${basePath}editTemplateDetail`, data || {})
  },

  deleteTemplate(data): Promise<any> {
    return http.post(`${basePath}delTemplateDetail`, data || {})
  },
  batchAddTemplateDetail(data): Promise<any> {
    return http.post(`${basePath}batchAddTemplateDetail`, data)
  },
  templateDetailInUse(data): Promise<any> {
    return http.post(`${basePath}templateDetailInUse`, data, { useRes: true })
  },
}
