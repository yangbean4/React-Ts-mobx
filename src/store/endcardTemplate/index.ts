import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'



export class EndcardTemplateStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof EndcardTemplateStore
     */
    @observable
    getEndcardTemplatesloading: boolean = false
    /**
     * 用户列表
     *
     * @type {IEndcardTemplateStore.IEndcardTemplate[]}
     * @memberof EndcardTemplateStore
     */
    @observable
    endcardTemplates: IEndcardTemplateStore.IEndcardTemplate[] = []

    @observable
    endcardTemplate: IEndcardTemplateStore.IEndcardTemplate
    /**
     * table page
     *
     * @type {number}
     * @memberof EndcardTemplateStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof EndcardTemplateStore
     */
    @observable
    pageSize: number = 10
    /**
     * endcardTemplates total
     *
     * @type {number}
     * @memberof EndcardTemplateStore
     */
    @observable
    total: number = 0

    @observable
    filters: IEndcardTemplateStore.SearchParams = {}

    /**
     * 加载用户列表
     *
     * @memberof EndcardTemplateStore
     */

    @action
    getEndcardTemplates = async () => {
        this.getEndcardTemplatesloading = true
        try {
            const res = await this.api.endcardTemplate.getTemplates({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.endcardTemplates = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.endcardTemplates = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getEndcardTemplatesloading = false
        })
    }

    createEndcardTemplate = async (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => {
        const res = await this.api.endcardTemplate.createTemplate(endcardTemplate)
        this.changepage(1)
        return res
    }

    @action
    modifyEndcardTemplate = async (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => {
        return await this.api.endcardTemplate.modifyTemplate(endcardTemplate)
    }


    @action
    changepage = (page: number) => {
        this.page = page
        this.getEndcardTemplates()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getEndcardTemplates()
    }

    @action
    changeFilter = (data: IEndcardTemplateStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    setEndcardTemplate = (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => {
        this.endcardTemplate = endcardTemplate
    }
    @action
    clearEndcardTemplate = () => {
        this.endcardTemplate = undefined
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

export default new EndcardTemplateStore()
