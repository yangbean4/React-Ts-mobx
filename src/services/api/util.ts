/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-08-20 10:03:13
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-08-20 10:03:13
 */

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
  uploadTemplate(data): Promise<any> {
    return http.post(`${basePath}uploadTemplate`, data || {})
  },
  uploadTemplateImage(data, config): Promise<any> {
    return http.post(`${basePath}uploadTemplateImage`, data || {}, config)
  },

  uploadFirstSceneImage(data): Promise<any> {
    return http.post(`${basePath}uploadFirstScene`, data || {})
  },

}
