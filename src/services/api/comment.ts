import http from '@services/http'
const basePath = 'api/comment/'
export default {
    // templatelist
    getCommentTplList(data): Promise<any> {
        return http.post(`${basePath}commentList`, data || {})
    },
    // add commentlist
    addCommentItem(data): Promise<any> {
        return http.post(`${basePath}addComment`, data || {})
    },
    // editer
    modifyCommentItem(data): Promise<any> {
        return http.post(`${basePath}editComment`, data || {})
    },
    // grouplist
    getCommentGroup(data): Promise<any> {
        return http.post(`${basePath}commentGroupList`, data || {})
    },
    // add group
    addCommentGroup(data): Promise<any> {
        return http.post(`${basePath}addCommentGroup`, data || {})
    },
    // edit group
    modifyCommentGroup(data): Promise<any> {
        return http.post(`${basePath}editCommentGroup`, data || {})
    },
    // tpl language
    getCommentLanguage(): Promise<any> {
        return http.post(`${basePath}commentLanguage`)
    },
    // group language
    getGroupLanguage(): Promise<any> {
        return http.post(`${basePath}groupLanguage`)
    },
    // select template
    selectTemplate(data): Promise<any> {
        return http.post(`${basePath}commentTemplates`, data || {})
    },
    // get Group List
    getCommentGroupId(): Promise<any> {
        return http.post(`${basePath}commentGroups`)
    }
}