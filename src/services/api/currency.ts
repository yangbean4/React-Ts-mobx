
import http from '@services/http'
const basePath = '/api/virtualCurrency/'
export default {
  getCurrency(data): Promise<any> {
    return http.post(`${basePath}pkgList`, data || {})
  },

  createCurrency(data): Promise<any> {
    return http.post(`${basePath}addVirtualCurrency`, data || {})
  },

  modifyCurrency(data): Promise<any> {
    return http.post(`${basePath}editVirtualCurrency`, data || {})
  },

  // deleteCurrency(data): Promise<any> {
  //   return http.post(`${basePath}delCurrency`, data || {})
  // },

  fullCurrency(): Promise<any> {
    return http.post(`${basePath}fullCurrency`)
  },

  getCurrencyInfo(data): Promise<any> {
    return http.post(`${basePath}detail`, data)
  },
}
