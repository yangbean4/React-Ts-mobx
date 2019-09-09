import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'
import { authStore } from '../'
export class TemplatesStore extends StoreExt {

    @observable
    TemplatesTarget = {}

    @observable
    getTemplatesloading: boolean = false

    @observable
    templateConfig: TemplateConfig

    @observable
    template_pid: number

    @observable
    template_pname: string

    @observable
    templatesList: ITemplateStore.ITemplate[] = []

    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    pageSize: number = 10
    /**
     * users total
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    total: number = 0

    @observable
    filter: ITemplateStore.SearchParams = {}

    @action
    changepage = (page: number) => {
        this.page = page
        this.getTemplates()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getTemplates()
    }

    @action
    changeFilter = (data: ITemplateStore.SearchParams = {}) => {
        this.filter = { ...data }
        this.changepage(1)
    }

    reset = () => {
        this.page = 1
        this.pageSize = 10
        this.total = 0
        this.templatesList = []
        this.filter = {}
    }

    @action
    getTemplateSelect = async (pid: number, useCache?: boolean) => {
        if (useCache && this.TemplatesTarget[pid] && this.TemplatesTarget[pid].length) {
            return;
        } else {
            let data = []
            try {
                const res = await this.api.template.getTemplateDetailIdName({ pid })
                data = res.data
            } catch (error) {

            }
            runInAction('SET_TARGET', () => {
                this.TemplatesTarget[pid] = data.map(ele => {
                    return {
                        label: ele.template_name,
                        value: ele.id
                    }
                })
            })
        }
    }

    @action
    clearTemplatesTarget() {
        this.TemplatesTarget = {}
    }


    @action
    getTemplates = async () => {
        this.getTemplatesloading = true
        try {
            const res = await this.api.template.getTemplates({ page: this.page, pageSize: this.pageSize, pid: this.template_pid, ...this.filter })
            runInAction('SET_USER_LIST', () => {
                this.templatesList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.templatesList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getTemplatesloading = false
        })
    }
    createTemplate = async (template: ITemplateStore.ITemplate) => {
        return await this.api.template.createTemplate({ ...template, pid: this.template_pid })
    }

    upTemplate = async (data: FormData) => {
        data.append('pid', this.template_pid.toString())
        return await this.api.util.uploadToS3(data)
    }

    modifyTemplate = async (template: ITemplateStore.ITemplate) => {
        return await this.api.template.modifyTemplate({ ...template, pid: this.template_pid })
    }

    deleteTemplate = async (id: number) => {
        const res = await this.api.template.deleteTemplate({ id })
        this.getTemplates()
        return res
    }

    @action
    setTemplateType = (type: number) => {
        this.reset()
        if (!isNaN(type)) {
            const SIDEBAR = authStore.tmpSidebar.find(ele => ele.id === type)
            this.templateConfig = SIDEBAR.config
            this.template_pid = type
            this.template_pname = SIDEBAR.primary_name
            this.getTemplates()
        }
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

export default new TemplatesStore()
