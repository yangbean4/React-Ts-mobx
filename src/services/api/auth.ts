import http from '@services/http'

export default {
    // 登录
    login(data = {}): Promise<any> {
        return http.post('/login', data)
    },
    logout(): Promise<any> {
        return http.post('/logout')
    },
    getSidebar(): Promise<any> {
        return http.post('/api/template/sidebarTemplate')
    },
}
