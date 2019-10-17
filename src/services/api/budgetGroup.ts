import http from '@services/http'

const basePath = '/api/budgetGroup/'

export default {
    getDetail(data): Promise<any> {
        return http.post(`${basePath}detail`, data || {})
    },
    getCampaignRelated(data): Promise<any> {
        return http.post(`${basePath}CampaignRelated`,data|| {})
    },
    getAccount(): Promise<any> {
        return http.post(`/api/account/sourceAccount`, {})
    },
    getCampaign(): Promise<any> {
        return http.post(`/api/campaigns/campaigns`, {})
    },
    addBudgetGroup(data): Promise<any> {
        return http.post(`${basePath}add`, data)
    },
    editBudget(data): Promise<any> {
        return http.post(`${basePath}edit`, data)
    },
    //获取编辑数据
    editBudgetGroup(data): Promise<any> {
        return http.post(`${basePath}groupInfo`, data)
    },
    delBudgetGroup(data): Promise<any> {
        return http.post(`${basePath}del`, data)
    },

}