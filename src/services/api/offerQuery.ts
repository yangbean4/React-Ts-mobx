import http from '@services/http'

export default {
  getOfferList(data): Promise<any> {
    return http.post('api/offerQuery/listDetail', data || {})
  }
}
