
import http from '@services/http'
const basePath = '/api/manualEcpm/'
export default {
    getListDetail(data): Promise<any> {
        return http.post(`${basePath}listDetail`, data || {})
    },
    getAppIdCampaigns(): Promise<any> {
        return http.post(`${basePath}appIdCampaigns`, {})
    },
    getGeoList(): Promise<any> {
        return http.post(`api/app/country`, {})
    },
    getPidType(): Promise<any> {
        return http.post(`api/app/pidType`, {})
    },
    getPkgNamePid(): Promise<any> {
        return http.post(`${basePath}pkgNamePid`, {})
    },
    deleteManualCpm(data): Promise<any> {
        return http.post(`${basePath}delete`, data || {})
    },
    getInfo(data): Promise<any> {
        return http.post(`${basePath}info`, data || {})
    },
    manualEcpmAdd(data): Promise<any> {
        return http.post(`${basePath}add`, data || {})
    },
    manualEcpmUpdate(data): Promise<any> {
        return http.post(`${basePath}update`, data || {})
    },


}
