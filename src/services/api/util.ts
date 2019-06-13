
import http from '@services/http'
const basePath = '/api/upload/'
export default {
  uploadToS3(data): Promise<any> {
    return http.post(`${basePath}uploadToS3`, data || {})
  },

  uploadToLocal(data): Promise<any> {
    return http.post(`${basePath}uploadToLocal`, data || {})
  },
  uploadCoverImage(data): Promise<any> {
    return http.post(`${basePath}uploadCoverImage`, data || {})
  },
  uploadIcon(data): Promise<any> {
    return http.post(`${basePath}uploadIcon`, data || {})
  },
}
