
import http from '@services/http'
const basePath = '/api/campaigns/'
export default {
  getCampaigns(data): Promise<any> {
    return http.post(`${basePath}campaignsList`, data || {})
  },
  createCampaigns(data): Promise<any> {
    return http.post(`${basePath}addCampaigns`, data || {})
  },
  modifyCampaigns(data): Promise<any> {
    return http.post(`${basePath}editCampaigns`, data || {})
  },
  copyCampaignsSubmit(data): Promise<any> {
      return http.post(`${basePath}duplicateCampaigns`, data || {})
  },
  editBeforeCampaigns(data): Promise<any> {
      return http.post(`${basePath}campaignsDetail`, data || {})
  }
}
