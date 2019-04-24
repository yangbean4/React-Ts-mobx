
import http from '@services/http'
const basePath = '/api/role/'
export default {
  getRoles(data): Promise<any> {
    return http.post(`${basePath}allRole`, data || {})
  },

  createRole(data): Promise<any> {
    return http.post(`${basePath}addRole`, data || {})
  },

  modifyRole(data): Promise<any> {
    return http.post(`${basePath}editRole`, data || {})
  },

  deleteRole(data): Promise<any> {
    return http.post(`${basePath}delRole`, data || {})
  },

  fullRole(): Promise<any> {
    return http.post(`${basePath}fullRole`)
  },

  getRole(data): Promise<any> {
    return http.post(`${basePath}getRole`, data)
  },
}
