
import http from '@services/http'
const basePath = '/api/account/'
export default {
  getAccounts(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createAccount(data): Promise<any> {
    return http.post(`${basePath}addAccount`, data || {})
  },

  modifyAccount(data): Promise<any> {
    return http.post(`${basePath}editAccount`, data || {})
  },

  getAllCompany(data?): Promise<any> {
    return http.post(`/api/company/companyList`, data || {})
  },

  // deleteAccount(data): Promise<any> {
  //   return http.post(`${basePath}delAccount`, data || {})
  // },

  // fullAccount(): Promise<any> {
  //   return http.post(`${basePath}fullAccount`)
  // },

  // getAccount(data): Promise<any> {
  //   return http.post(`${basePath}getAccount`, data)
  // },

  accountTypeList(): Promise<any> {
    return http.post(`${basePath}accountTypeList`)
  },
}
