import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Tabs } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import style from './index.scss'

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
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, configStore } = store
        const { getConfigsList, changeFilter, targetConfig, submitConfig } = configStore
        return { getConfigsList, changeFilter, routerStore, targetConfig, submitConfig }
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
    private isAdd: boolean

    @observable
    private editData: IConfigStore.IConfigTarget = {}

    @observable
    private addConfigGroup: IConfigStore.IConfigTarget = { basic1: [] }

    @computed
    get activeIndex() {
        return tabArr.findIndex(item => item === this.activeKey)
    }


    @action
    onCancel = () => {
        if (this.activeIndex === 0) {
            this.props.routerStore.push('/config')
        } else {
            this.cardChange(tabArr[this.activeIndex - 1])
        }
    }

    @action
    onSubmit = async (value) => {
        const key = this.activeKey.toLowerCase()
        runInAction('Change_', () => {
            this.editData[key] = value
        })
        if (this.activeIndex === tabArr.length - 1) {
            await this.props.submitConfig(this.editData)
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

            const Detail = await this.api.config.allTemplateDetail({ platform: (this.props.targetConfig || {}).platform || 'android' })
            runInAction('Change_', () => {
                this.isAdd = !!this.props.routerStore.location.pathname.includes('add');
                this.editData = editData
                this.addConfigGroup = Detail.data
            })
        } catch (error) {
            console.log(error);
            this.props.routerStore.push('/config')
        }

    }

    componentWillMount() {
        const location = this.props.routerStore.location;
        const isAdd = location.pathname.includes('add')

        if (isAdd) {
            this.initDetail()
        } else {
            const routerId = location.pathname.split('/').pop()
            const Id = Number(routerId)
            this.initDetail(!isNaN(Id) ? Id : null)
        }
    }

    getBox = (item) => {
        const Components = asynchronousComponents[item || this.activeKey]
        const boxProps = () => {
            const key = item.toLocaleLowerCase()
            const props = {
                onCancel: this.onCancel,
                onSubmit: this.onSubmit,
                editData: this.editData[key],
                // ----多传两个props
                type: key.toLowerCase(),
                activeKey: this.activeKey.toLowerCase(),
                // ----用于拖动是判断是否是当前
                addList: this.addConfigGroup[key],
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


    render() {
        const { targetConfig = {} } = this.props
        return (
            <div className={style.configModal}>
                <div className={style.head}>
                    <div className={style.row}>
                        <div className={style.title}>
                            Pkg Name
                    </div>
                        <div className={style.value}>
                            {targetConfig.pkg_name}
                        </div>
                    </div>
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
                            Config Version
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
                                tabArr.map(item => (
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
