import * as React from 'react'
import { Tabs } from 'antd'
import loadable from 'react-loadable'
import { observable, action, computed, runInAction } from 'mobx'
import { inject, observer } from 'mobx-react'
import { camelCase } from '@utils/index'
import PageLoading from '@components/PageLoading'
import * as styles from './index.scss'
const TabPane = Tabs.TabPane;
const loadComponent = (loader: () => Promise<any>) =>
    loadable({
        loader,
        loading: PageLoading
    })

const asyncComponent = {
    app: loadComponent(() => import(/* webpackChunkName:"Apps_Manage_app" */ './App')),
    placement: loadComponent(() => import(/* webpackChunkName:"Apps_Manage_placement" */ './Placement')),
}

const tabArr = Object.keys(asyncComponent)

interface IProps extends IStoreProps {

}

interface IStoreProps {
    routerStore?: RouterStore
    clearCache?: () => void
}

@inject((store: IStore): IStoreProps => {
    const { routerStore, appGroupStore } = store
    const { clearCache } = appGroupStore
    return { routerStore, clearCache }
})

@observer
class AppGroupModal extends React.Component<IProps>{


    @observable
    private activeKey: string = tabArr[0]

    @observable
    private hasGo = new Set(tabArr[0])

    @observable
    private isAdd: boolean

    @observable
    private Id: string

    @computed
    get activeIndex() {
        return tabArr.findIndex(item => item === this.activeKey)
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

    @action
    onCancel = () => {
        if (this.activeIndex === 0) {
            this.props.routerStore.push('/apps')
        } else {
            this.cardChange(tabArr[this.activeIndex - 1])
        }
    }

    @action
    onSubmit = () => {
        if (this.activeIndex === tabArr.length - 1) {
            this.props.routerStore.push('/config')
        } else {
            this.cardChange(tabArr[this.activeIndex + 1])
        }
    }

    getBox = (item: string) => {
        const Components = asyncComponent[item || this.activeKey]
        const props = {
            Id: this.Id,
            isAdd: this.isAdd,
            onCancel: this.onCancel,
            onSubmit: this.onSubmit,
        }
        return <Components {...props} />
    }

    runInit = () => {
        const location = this.props.routerStore.location;
        const isAdd = location.pathname.includes('add')
        let Id;
        if (!isAdd) {
            const routerId = location.pathname.split('/').pop()
            Id = Number(routerId)
        }
        runInAction('SET_StATE', () => {
            this.isAdd = isAdd;
            this.Id = Id
        })
    }

    componentWillMount() {
        this.runInit()
    }
    componentWillUnmount() {
        this.props.clearCache()
    }

    render() {
        return (
            <div className="AppGroupModal">
                <div className={styles.box}>
                    {
                        <Tabs type="card" activeKey={this.activeKey} onChange={val => this.cardChange(val)}>
                            {
                                tabArr.map(item => (
                                    <TabPane tab={camelCase(item)} key={item} disabled={this.compuDis(item)}>
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

export default AppGroupModal
