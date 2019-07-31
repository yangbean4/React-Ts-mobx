
import http from '@services/http'
const basePath = '/api/sceneConfig/'
export default {
  getScenes(data): Promise<any> {
    return http.post(`${basePath}listDetail`, data || {})
  },

  createScene(data): Promise<any> {
    return http.post(`${basePath}add`, data || {})
  },

  modifyScene(data): Promise<any> {
    return http.post(`${basePath}update`, data || {})
  },

  deleteScene(data): Promise<any> {
    return http.post(`${basePath}delScene`, data || {})
  },

  getScene(data): Promise<any> {
    return http.post(`${basePath}info`, data)
  },

  categoryAppId(): Promise<any> {
    return http.post(`${basePath}categoryAppId`)
  },
}
