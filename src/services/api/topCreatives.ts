import http from '@services/http'

const basePath = 'api/topCreative/'

export default {
  getTopCreativeList(data): Promise<any> {
    return http.post(`${basePath}detail`, data || {})
  },
  getCreative(): Promise<any> {
    return http.post('api/creative/creatives');
  },
  getEndcard(): Promise<any> {
    return http.post('api/endcard/endcards');
  }
}
