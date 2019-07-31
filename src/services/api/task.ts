
import http from '@services/http'
const basePath = '/api/task/'
export default {
    /**
     * 获取task列表
     */
    getTaskList(data): Promise<any> {
        return http.post(`${basePath}detail`, data || {})
    },
    /**
     * 获取pkgname列表
     */
    getPkgNameList(data): Promise<any> {
        return http.post(`${basePath}pkgnameList`, data || {})
    },

    /**
     * 开始task
     */
    startTask(data): Promise<any> {
        return http.post(`${basePath}start`, data || {})
    },

    /**
     * 编辑task
     */
    editTask(data): Promise<any> {
        return http.post(`${basePath}editTask`, data || {})
    },
    /**
     * 创建task
     */
    createTask(data): Promise<any> {
        return http.post(`${basePath}addTask`, data || {})
    },
    /**
     * 获取Ige_pkgname与app的关系
     */
    getIgePkgname(): Promise<any> {
        return http.post(`${basePath}appInfo`)
    },
    /**
     * 获取pkgname列表
     */
    getPkgnameList(data): Promise<any> {
        return http.post(`${basePath}pkgnameList`, data || {})
    },

    /**
     * 获取资源数量
     */
    getDemoNum(data): Promise<any> {
        return http.post(`${basePath}demoNum`, data || {})
    }
}
