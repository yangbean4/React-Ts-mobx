import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'

export class ConfigStore extends StoreExt {
    @observable
    getConfigLoading: boolean = false

    @observable
    configsList: IConfigStore.IConfig[] = []

    @observable
    targetConfig: IConfigStore.IConfigTarget

    @observable
    allTemplateInfo: ICustomStore.ICustomTree[] = []

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

    @observable
    pkgNameAndBundleId: IConfigStore.iosAndAnd = {
        ios: [],
        android: []
    }


    @observable
    allConfig: string[] = []
    /**
     * users total
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    total: number = 0

    @observable
    filters: IConfigStore.SearchParams = {}

    @action
    clearConfigAll = () => {
        this.allConfig = []
    }
    // @action
    // getAllConfig = async () => {
    //     try {
    //         this.clearConfigAll()
    //         const res = await this.api.config.fullConfig()
    //         runInAction('aet_all_roleList', () => {
    //             this.allConfig = Object.values(res.data)
    //         })
    //     } catch (err) { }
    // }
    @action
    getAllConfig = async () => {
        try {
            const res = await this.api.config.fullConfig()
            runInAction('aet_all_roleList', () => {
                this.pkgNameAndBundleId = res.data
            })
        } catch (err) { }
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getConfigsList()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getConfigsList()
    }

    @action
    changeFilter = (data: IConfigStore.SearchParams = {}) => {
        this.filters = { ...data }
        this.changepage(1)
    }
    @action
    setTargetConfig = (config: IConfigStore.IConfigTarget) => {
        this.targetConfig = config
    }

    @action
    reset = () => {
        this.page = 1
        this.pageSize = 10
        this.total = 0
        this.configsList = []
    }

    @action
    fullTemplateAll = async () => {
        if (this.allTemplateInfo.length) {
            return
        }
        let data = []
        try {
            const res = await this.api.config.allTemplateInfo()
            data = res.data
        } catch (error) {

        }
        runInAction('SET_TEMP_TREE', () => {
            this.allTemplateInfo = data
        })

    }

    @action
    getConfigsList = async () => {
        try {
            const res = await this.api.config.getConfigs({ page: this.page, pageSize: this.pageSize, ...this.filters })
            const fmtArr: IConfigStore.IConfig[] = res.data.map(item => {
                const {
                    config_version, config_deploy_id, pkg_name, platform, totalConfig,
                    bundle_id
                } = item
                const verArr = (config_version || '').split(',')
                const idArr = (config_deploy_id || '').split(',')
                const versionArr = verArr.map((j, i) => ({ version: j, id: idArr[i] }))
                return {
                    versionArr,
                    bundle_id,
                    pkg_name, platform, totalConfig
                }
            })

            runInAction('HIDE_Config_LIST_LOADING123', () => {
                this.configsList = fmtArr
                this.total = res.total
            })
        } catch (err) {
            runInAction('HIDE_Config_LIST_LOADING123', () => {
                this.configsList = []
                this.total = 0
            })
        }
        runInAction('HIDE_Config_LIST_LOADING', () => {
            this.getConfigLoading = false
        })
    }

    submitConfig = (data) => {
        if (data.config_deploy_id) {
            return this.modifyConfig(data)
        } else {
            return this.createConfig(data)
        }
    }

    createConfig = async (config: IConfigStore.IConfig) => {
        return await this.api.config.createConfig(config)
    }

    modifyConfig = async (config: IConfigStore.IConfig) => {
        return await this.api.config.modifyConfig(config)
    }

    deleteConfig = async (data) => {
        const res = await this.api.config.deleteConfig(data)
        this.getConfigsList()
        return res
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

export default new ConfigStore()
