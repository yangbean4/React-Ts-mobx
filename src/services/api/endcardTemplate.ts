
import http from '@services/http'
const basePath = '/api/endcard/'
export default {
  getTemplates(data): Promise<any> {
    return http.post(`${basePath}endcardTemplateList`, data || {})
  },

  createTemplate(data): Promise<any> {
    return http.post(`${basePath}addEndcardTemplate`, data || {})
  },

  modifyTemplate(data): Promise<any> {
    return http.post(`${basePath}editEndcardTemplate`, data || {})
  },
}
