import http from '@services/http'

export default {
    // templatelist
    getCommentTplList(data): Promise<any> {
        return http.post('api/comment/commentList', data || {})
    },
    // add commentlist
    addCommentItem(data): Promise<any> {
        return http.post('api/comment/addComment', data || {})
    },
    // editer
    modifyCommentItem(data): Promise<any> {
        return http.post('api/comment/editComment', data || {})
    },
    // grouplist
    getCommentGroup(data): Promise<any> {
        return http.post('api/comment/commentGroupList', data || {})
    },
    // add group
    addCommentGroup(data): Promise<any> {
        return http.post('api/comment/addCommentGroup', data || {})
    },
    // edit group
    modifyCommentGroup(data): Promise<any> {
        return http.post('api/comment/editCommentGroup', data || {})
    },
    // tpl language
    getCommentLanguage(data): Promise<any> {
        return http.post('api/comment/commentLanguage', data || {})
    },
    // group language
    getGroupLanguage(data): Promise<any> {
        return http.post('api/comment/groupLanguage', data || {})
    },
    // select template
    selectTemplate(data): Promise<any> {
        return http.post('api/comment/commentTemplates', data || {})
    }
}