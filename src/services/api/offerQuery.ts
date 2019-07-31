import http from '@services/http'

export default {
  getOfferList(data): Promise<any> {
    return http.post('api/offerQuery/listDetail', data || {})
  },
  exportData(data): Promise<any> {
    const mdata = { ...data, export: 1 }
    const formData = new FormData()
    Object.entries(mdata).forEach(([key, value]) => {
      value !== undefined && formData.append(key, value)
    })

    return http.post('api/offerQuery/listDetailExport', formData, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"
      }
    })
  },
}
