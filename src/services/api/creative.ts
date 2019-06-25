
import http from '@services/http'
const basePath = '/api/creative/'
export default {

  getAppsManage(data): Promise<any> {
    return http.post(`${basePath}appList`, data || {})
  },

  getCreative(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },

  createCreative(data): Promise<any> {
    return http.post(`${basePath}addCreative`, data || {})
  },

  modifyCreative(data): Promise<any> {
    return http.post(`${basePath}editCreative`, data || {})
  },

  copyCreative(data): Promise<any> {
    return http.post(`${basePath}duplicate`, data || {})
  },

  checkCreative(data): Promise<any> {
    return http.post(`${basePath}checkCreative`, data, { useRes: true })
  },

  uploadVideo(data): Promise<any> {
    return http.post(`api/upload/uploadVideo`, data || {})
  },
  handleUploadImg(data): Promise<any> {
    return http.post(`api/upload/handleUploadImg`, data || {})
  },

  getCreativeType(): Promise<any> {
    return http.post(`${basePath}creativeType`)
  },

  getCreativeInfo(data): Promise<any> {
    return http.post(`${basePath}info`, data)
  },
  getappIds(): Promise<any> {
    return http.post(`/api/endcard/appIds`)
  },
  getlanguage(): Promise<any> {
    return http.post(`/api/endcard/language`)
  },

  getLeadContents(): Promise<any> {
    return http.post(`${basePath}getLeadContents`)
  },

}
