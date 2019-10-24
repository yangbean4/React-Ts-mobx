import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Tabs, Button, Modal } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import * as style from './index.scss'
import { arrayToTree, queryArray } from '@utils/index'
import { conItem } from './type'

import Loadable from 'react-loadable'

import PageLoading from '@components/PageLoading'

const loadComponent = (loader: () => Promise<any>) =>
    Loadable({
        loader,
        loading: PageLoading
    })
const asynchronousComponents = {
    Basic1: loadComponent(() => import(/* webpackChunkName: "Basic1" */ './Basic')),
    Basic2: loadComponent(() => import(/* webpackChunkName: "Basic1" */ './Basic')),
    POP: loadComponent(() => import(/* webpackChunkName: "POP" */ './POP')),
    PID: loadComponent(() => import(/* webpackChunkName: "PID" */ './PID/index')),
}

const tabArr = Object.keys(asynchronousComponents)

const TabPane = Tabs.TabPane;

interface IStoreProps {
    getConfigsList?: () => Promise<any>
    changeFilter?: (params: IConfigStore.SearchParams) => void
    routerStore?: RouterStore
    targetConfig?: IConfigStore.IConfigTarget
    submitConfig?: (data) => Promise<any>
    setTargetConfig?: (con?: IConfigStore.IConfigTarget) => void
    getSidebar?: () => Promise<any>
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, configStore, authStore } = store
        const { getSidebar } = authStore
        const { getConfigsList, changeFilter, targetConfig, submitConfig, setTargetConfig } = configStore
        return { getConfigsList, changeFilter, routerStore, targetConfig, submitConfig, setTargetConfig, getSidebar }
    }
)
@observer
class ConfigModal extends ComponentExt<IStoreProps> {
    @observable
    private loading: boolean = false

    @observable
    private activeKey: string = tabArr[0]

    @observable
    private hasGo = new Set(tabArr[0])

    @observable
    private delCacheKey: string

    @observable
    private isAdd: boolean

    @observable
    private editData: IConfigStore.IConfigTarget = {}

    @observable
    private addConfigGroup: IConfigStore.IConfigTarget = { basic1: [] }

    @computed
    get allList() {
        const toTree = (list) => list ? arrayToTree<conItem>(list, 'id', 'pid') : []
        const basic1 = toTree(this.addConfigGroup['basic1'])
        const basic2 = toTree(this.addConfigGroup['basic2'])
        return {
            basic1,
            basic2,
            all: [].concat(basic1, basic2),
        }
    }

    @computed
    get localConfig() {
        const str = localStorage.getItem('TargetConfig')
        return str ? JSON.parse(str) : {}
    }

    @computed
    get useTargetConfig() {
        if (!this.props.targetConfig) {
            // this.props.setTargetConfig(this.localConfig)
            return this.localConfig
        }
        return this.props.targetConfig
    }

    @computed
    get activeIndex() {
        return tabArr.findIndex(item => item === this.activeKey)
    }

    @action
    setDelCacheKey(delCacheKey) {
        this.delCacheKey = delCacheKey
    }

    @action
    onCancel = () => {
        if (this.activeIndex === 0) {
            this.props.routerStore.push('/config')
        } else {
            this.cardChange(tabArr[this.activeIndex - 1])
        }
    }

    componentDidMount() {
        if (!this.props.targetConfig) {
            this.props.setTargetConfig(this.localConfig)
        }
    }


    @action
    saveData = (value) => {
        const key = this.activeKey.toLowerCase()
        runInAction('Change_', () => {
            this.editData[key] = value
        })
    }

    @action
    onSubmit = async (value) => {
        this.saveData(value)

        if (this.useTargetConfig.config_deploy_id) {
            const kpi = `edit${this.activeKey}`
            const res = await this.api.config[kpi](
                {
                    config_deploy_id: this.useTargetConfig.config_deploy_id,
                    [this.activeKey.toLowerCase()]: value,
                    type: this.activeKey === 'PID' ? 0 : undefined
                }
            )
            this.$message.success(res.message)
            this.props.getSidebar()
            // await this.initDetail(this.useTargetConfig.config_deploy_id)
        } else if (this.activeIndex === tabArr.length - 1) {
            const res = await this.props.submitConfig({ ...this.editData, ...this.useTargetConfig })
            this.$message.success(res.message)
            this.props.getSidebar()
        }

        if (this.activeIndex === tabArr.length - 1) {
            this.props.routerStore.push('/config')
        } else {
            this.cardChange(tabArr[this.activeIndex + 1])
        }
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }


    @action
    initDetail = async (id?) => {
        let editData = {
            basic1: [],
            basic2: [],
            pid: [],
            pop: {}
        }
        try {
            if (id) {
                const res = await this.api.config.getConfig({ config_deploy_id: id })
                const { basic1, basic2, pid, pop } = res.data
                editData = { basic1, basic2, pid, pop }
            }

            const Detail = await this.api.config.allTemplateDetail({
                platform: (this.useTargetConfig).platform || 'android',
                pkg_name: this.useTargetConfig.pkg_name
            })
            runInAction('Change_', () => {
                this.isAdd = !!this.props.routerStore.location.pathname.includes('add');
                this.editData = editData
                this.addConfigGroup = Detail.data
            })
            return;
        } catch (error) {
            //console.log(error);
            this.props.routerStore.push('/config')
        }

    }

    runInit = async () => {
        const location = this.props.routerStore.location;
        const isAdd = location.pathname.includes('add')

        if (isAdd) {
            return await this.initDetail()
        } else {
            const routerId = location.pathname.split('/').pop()
            const Id = Number(routerId)
            return await this.initDetail(!isNaN(Id) ? Id : null)
        }
    }

    componentWillMount() {
        this.runInit()
    }

    getBox = (item) => {
        const key = item.toLowerCase()
        const Components = asynchronousComponents[item || this.activeKey]

        const boxProps = () => {
            const props = {
                onCancel: this.goBack,
                onSubmit: this.onSubmit,
                editData: this.editData[key],
                RefreshData: this.runInit,
                configId: this.useTargetConfig.config_deploy_id,
                // ----多传两个props
                type: key.toLowerCase(),
                activeKey: this.activeKey.toLowerCase(),
                // ----用于拖动是判断是否是当前
                addList: !this.useTargetConfig.config_deploy_id ? this.allList[key] : this.allList.all,
            }
            return props
        }
        return <Components {...boxProps()} />
    }

    @action
    cardChange = (val) => {
        this.hasGo.add(this.activeKey)
        this.hasGo.add(val)
        runInAction('UP_ACTIVEKEY', () => {
            this.activeKey = val
        })
    }

    compuDis = (val) => {
        return (this.isAdd && !this.hasGo.has(val))
    }

    goBack = (value) => {
        if (!value) {
            // [...tabArr].filter(ele => ele !== this.activeKey)
            this.setDelCacheKey(this.activeKey)
            setImmediate(() => {
                this.setDelCacheKey('')
            })
        } else {
            // this.saveData(value)
        }
        this.onCancel()
    }


    render() {
        const targetConfig = this.useTargetConfig
        return (
            <div className={style.configModal}>
                <div className={style.head}>
                    <div className={style.row}>
                        <div className={style.title}>
                            Platform
                    </div>
                        <div className={style.value}>
                            {targetConfig.platform}
                        </div>
                    </div>
                    <div className={style.row}>
                        <div className={style.title}>
                            {targetConfig.platform === 'android' ? "Pkg Name" : "Bundle Id"}
                        </div>
                        <div className={style.value}>
                            {targetConfig.pkg_name}
                        </div>
                    </div>
                    <div className={style.row}>
                        <div className={style.title}>
                            SDK Version
                    </div>
                        <div className={style.value}>
                            {targetConfig.config_version}
                        </div>
                    </div>
                </div>
                <div className="main">
                    {
                        <Tabs type="card" activeKey={this.activeKey} onChange={val => this.cardChange(val)}>
                            {
                                tabArr.filter(item => item !== this.delCacheKey).map(item => (
                                    <TabPane tab={item} key={item} disabled={this.compuDis(item)}>
                                        {this.getBox(item)}
                                    </TabPane>
                                ))
                            }
                        </Tabs>
                    }
                </div>
            </div>
        )
    }
}

export default ConfigModal
