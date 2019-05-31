import http from '@services/http'

export default {
    getCompanys(data): Promise<any> {
        return http.post('api/company/detail', data || {})
    },
    createCompany(data): Promise<any> {
        return http.post('api/company/addCompany', data || {})
    },
    modifyCompany(data): Promise<any> {
        return http.post('api/company/editCompany', data || {})
    }
}