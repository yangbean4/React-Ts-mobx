
import http from '@services/http'
export default {
  getLogs(data): Promise<any> {
    return http.post(`/api/log/detail`, data || {})
  }
}
