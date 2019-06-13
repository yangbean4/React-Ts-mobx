import http from '@services/http'

export default {
    getCommentTplList(data): Promise<any> {
        return http.post('api/comment/commentList', data || {})
    },
    addCommentItem(data): Promise<any> {
        return http.post('api/comment/addComment', data || {})
    },
    modifyCommentItem(data): Promise<any> {
        return http.post('api/comment/editComment', data || {})
    },
    getCommentGroup(data): Promise<any> {
        return http.post('api/comment/commentGroupList', data || {})
    },
    addCommentGroup(data): Promise<any> {
        return http.post('api/comment/addCommentGroup', data || {})
    },
    modifyCommentGroup(data): Promise<any> {
        return http.post('api/comment/editCommentGroup', data || {})
    },
    getCommentLanguage(data): Promise<any> {
        return http.post('api/comment/commentLanguage', data || {})
    }
}