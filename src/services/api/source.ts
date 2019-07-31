import http from '@services/http'

export default {
    getSourcecompanys(data): Promise<any> {
        return http.post('api/company/detail', data || {})
    },
    createSourcecompany(data): Promise<any> {
        return http.post('api/company/addCompany', data || {})
    },
    modifySourcecompany(data): Promise<any> {
        return http.post('api/company/editCompany', data || {})
    }
}