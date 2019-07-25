import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../web.config'
import MyIcon from '@components/Icon'

interface IStoreProps {
    getScenesloading?: boolean
    scenes?: ISceneStore.IScene[]
    setScene?: (scene: ISceneStore.IScene) => void
    getScenes?: () => Promise<any>
    deleteScene?: (id: number) => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, sceneStore } = store
        const {
            getScenesloading,
            scenes,
            getScenes,
            deleteScene,
            handleTableChange,
            page,
            pageSize,
            total,
            setScene
        } = sceneStore
        return { routerStore, setScene, getScenesloading, scenes, getScenes, deleteScene, handleTableChange, page, pageSize, total }
    }
)
@observer
class SceneTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private delScene: ISceneStore.IScene = {}

    @action
    hideSceneModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }


    @action
    modifyScene = (scene: ISceneStore.IScene) => {
        // this.props.setScene(scene)
        this.props.routerStore.replace(`/scene/edit/${scene.id}`)
    }

    componentDidMount() {
        this.props.getScenes()
    }
    @action
    deleteModel = (scene: ISceneStore.IScene) => {
        this.delScene = scene
        this.hideSceneModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteScene(this.delScene.id)
        message.success(data.message)
        this.hideSceneModalVisible()
    }

    render() {
        const {
            scrollY,
            getScenesloading,
            scenes,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<ISceneStore.IScene>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getScenesloading}
                    dataSource={scenes}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ISceneStore.IScene> key="id" title="ID" dataIndex="id" width={100} />
                    <Table.Column<ISceneStore.IScene> key="scene_name" title="Scene Name" dataIndex="scene_name" width={200} />
                    <Table.Column<ISceneStore.IScene> key="app_id" title="App ID" dataIndex="app_id" width={100} />
                    <Table.Column<ISceneStore.IScene>
                        key="category_name"
                        title="Category"
                        dataIndex="category_name"
                        width={200}
                    />
                    <Table.Column<ISceneStore.IScene>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={200}
                    // render={(_) => (
                    //     statusOption.find(item => item.value === _).key
                    // )}
                    />
                    <Table.Column<ISceneStore.IScene>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Creative Analysis-Scene Config-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyScene(record)}>
                                            <Icon type="form" />
                                        </a>)
                                    ])
                                }
                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}

export default SceneTable
