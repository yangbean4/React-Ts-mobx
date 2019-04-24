
import http from '@services/http'
const basePath = '/api/permission/'
export default {
  getPermissions(data): Promise<any> {
    return http.post(`${basePath}allPermission`, data || {})
  },

  createPermission(data): Promise<any> {
    return http.post(`${basePath}addPermission`, data || {})
  },

  modifyPermission(data): Promise<any> {
    return http.post(`${basePath}editPermission`, data || {})
  },

  deletePermission(data): Promise<any> {
    return http.post(`${basePath}delPermission`, data || {})
  },

  getPermissionTree(): Promise<any> {
    return http.post(`${basePath}getPermission`)
  },
}
