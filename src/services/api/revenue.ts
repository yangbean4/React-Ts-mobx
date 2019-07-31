import http from '@services/http'

export default {
  getRevenueList(data): Promise<any> {
    return http.post('api/import/detail', data || {})
  },
  getUserList(): Promise<any> {
    return http.post('api/import/operatorList')
  },
  uploadExel(data): Promise<any> {
    return http.post('api/import/uploadFile', data || {})
  },
  addRevenueList(data): Promise<any> {
    return http.post('api/import/add', data || {})
  }
}
