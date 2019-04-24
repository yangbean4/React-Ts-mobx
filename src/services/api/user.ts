import http from '@services/http'

export default {
    getUsers(data): Promise<any> {
        return http.post('/api/user/allInfo', data || {})
    },

    createUser(data): Promise<any> {
        return http.post('/api/user/addUser', data || {})
    },

    modifyUser(data): Promise<any> {
        return http.post('/api/user/editUser', data || {})
    },

    deleteUser(data): Promise<any> {
        return http.post('/api/user/delUser', data || {})
    }
}
