
import http from '@services/http'
const basePath = '/api/iosWhite/'
export default {
    getList(data): Promise<any> {
        return http.post(`${basePath}detail`, data || {})
    },
    getIosWhite(data): Promise<any> {
        return http.post(`${basePath}iosWhite`, data)
    },
    create(data): Promise<any> {
        return http.post(`${basePath}add`, data)
    },
    edit(data): Promise<any> {
        return http.post(`${basePath}edit`, data)
    },
    del(data): Promise<any> {
        return http.post(`${basePath}del`, data)
    },
}
