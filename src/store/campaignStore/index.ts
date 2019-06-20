import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'

export class CampaignStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof CampaignStore
     */
    @observable
    getCampaignsLoading: boolean = false

    @observable
    campaignsType: string
    /**
     * 用户列表
     *
     * @type {IAccountStore.IAccount[]}
     * @memberof CampaignStore
     */
    @observable
    campaigns: ICampaignStore.ICampaignGroup[] = []

    @observable
    campaign: ICampaignStore.ICampaignGroup
    /**
     * table page
     *
     * @type {number}
     * @memberof CampaignStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof CampaignStore
     */
    @observable
    pageSize: number = 10
    /**
     * accounts total
     *
     * @type {number}
     * @memberof CampaignStore
     */
    @observable
    total: number = 0

    @observable
    filters: ICampaignStore.SearchParams = {}

    @observable
    optionListDb: ICampaignStore.OptionListDb = {
        TargetCode: [],
        CommentID: [],
    }
    
    @action
    getTargetCode = async () => {
        const res = await this.api.appGroup.getCountry()
        runInAction('SET', () => {
            this.optionListDb.TargetCode = res.data;
        })
    }

    @action
    getCommentID = async () => {
        const res = await this.api.comment.getCommentGroupId()
        runInAction('SET', () => {
            this.optionListDb.CommentID = res.data;
        })
    }

    @action
    getCommentsGroupId = async () => {
        const res = await this.api.comment.getCommentGroupId()
        runInAction('SET', () => {
            this.optionListDb.CommentID = res.data
        })
    }

    @action
    clearCache = () => {
        let target = {}
        Object.keys(this.optionListDb).forEach(key => target[key] = [])
        runInAction('CLEAR', () => {
            this.optionListDb = target
        })
    }
    // @action
    // getOptionListDb = async (id: number) => {
    //     const keys = Object.keys(this.optionListDb)
    //     const promiseAll = keys.map(key => this.api.campaigns[`get${key}`](
    //         key === 'VC' && this.campaign ? { id: this.campaign.id || id } : undefined
    //     ))
    //     Promise.all(promiseAll).then(data => {
    //         const target = {}
    //         keys.forEach((key, index) => {
    //             target[key] = data[index].data
    //         })
    //         runInAction('SET', () => {
    //             this.optionListDb = target
    //         })
    //     })
    // }

    @action
    setCampaignType = (campaignsType: string) => {
        this.campaignsType = campaignsType
        this.changeFilter({})
        this.pageSize = 10
    }

    /**
     * 加载用户列表
     *
     * @memberof AccountStore
     */

    @action
    getCampaigns = async () => {
        this.getCampaignsLoading = true
        try {
            let data = {
                page: this.page, pageSize: this.pageSize, ...this.filters,
            }
            const res = await this.api.appsManage.getAppsManage(data)
            runInAction('SET_CAMPAIGN_LIST', () => {
                this.campaigns = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_CAMPAIGN_LIST', () => {
                this.campaigns = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getCampaignsLoading = false
        })
    }

    createCampaingn = async (campaign: ICampaignStore.ICampaignGroup) => {
        const res = await this.api.campaigns.createCampaigns(campaign)
        this.changepage(1)
        return res
    }

    @action
    modifyCampaingn = async (campaign: ICampaignStore.ICampaignGroup) => {
        const res = await this.api.campaigns.modifyCampaigns(campaign)
        this.changepage(1)
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getCampaigns()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCampaigns()
    }

    @action
    changeFilter = (data: ICampaignStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setCampaingn = (campaign: ICampaignStore.ICampaignGroup) => {
        this.campaign = campaign
    }
    @action
    clearCampaingn = () => {
        this.campaign = undefined
    }

    handleTableChange = (pagination: PaginationConfig) => {
        const { current, pageSize } = pagination
        if (current !== this.page) {
            this.changepage(current)
        }
        if (pageSize !== this.pageSize) {
            this.changePageSize(pageSize)
        }
    }
}

export default new CampaignStore()
