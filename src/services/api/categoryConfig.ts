import http from '@services/http'
const basePath = '/api/categoryConfig/'
export default {
    getDetail(data): Promise<any> {
        return http.post(`${basePath}detail`, data || {})
    },
    addCategory(data):Promise<any> {
        return http.post(`${basePath}addCategory`, data || {})
    },
    editCategory(data):Promise<any> {
        return http.post(`${basePath}editCategory`, data || {})
    },
    //获取单个category config 信息
    info(data):Promise<any> {
        return http.post(`${basePath}info`, data || {})
    },
    getList(){
        return http.post(`api/app/category`,{})
    }
}