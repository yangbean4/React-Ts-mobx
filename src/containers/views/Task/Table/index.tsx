import * as React from 'react'
import { Table, Icon, Divider, Modal, Row, Col, Input, Button, Tooltip } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusEnum } from '../web.config'

import * as styles from '../index.scss'
console.log(styles)

interface IStoreProps {
    getTaskLoading?: boolean
    taskList?: ITaskStore.ITaskForList[]
    getTaskList?: () => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore,
    setTaskAttr?: (task: ITaskStore.ITaskForList, update: ITaskStore.ITaskForList) => void
    setSceneViewConfig?: (config: any[]) => void

}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, taskStore } = store
        const {
            getTaskLoading,
            taskList,
            getTaskList,
            handleTableChange,
            page,
            pageSize,
            total,
            setTaskAttr,
            setSceneViewConfig
        } = taskStore
        return { routerStore, getTaskLoading, taskList, getTaskList, handleTableChange, page, pageSize, total, setTaskAttr, setSceneViewConfig }
    }
)
@observer
class AppGroupTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private editRemarkLoading: boolean = false;

    @observable
    private selectTask: ITaskStore.ITaskForList = {};

    @observable
    private editRemarkValue: string = '';

    @action
    showEditRemarkModal = (task: ITaskStore.ITaskForList) => {
        this.selectTask = task;
        this.editRemarkValue = task.remark;
        this.editRemarkLoading = false;
        this.toggleRemarkModalVisible();
    }
    @action
    toggleRemarkModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    remarkInputChange = (e) => {
        this.editRemarkValue = e.target.value
    }

    /**
     * 进入预览页面
     */
    showSceneImage = (task: ITaskStore.ITaskForList) => {
        const config = statusEnum.Waiting === task.task_process_status ? task.sen_scene_img_list : task.sen_scene_img_config;
        this.props.setSceneViewConfig(config);
        // debugger
        this.props.routerStore.push(`/task/sceneImage`)
    }
    /**
     * 启动task
     */
    startTask = async (task: ITaskStore.ITaskForList) => {
        await this.api.task.startTask({ id: task.id });
        this.props.getTaskList()
        // this.props.setTaskAttr(task, {
        //     task_process_status: statusEnum.Waiting
        // });

    }

    /**
     * 暂停task
     */
    pauseTask = async (task: ITaskStore.ITaskForList) => {
        await this.api.task.editTask({
            taskId: task.id,
            status: statusEnum.Pause
        });
        // this.props.getTaskList()
        this.props.setTaskAttr(task, {
            task_process_status: statusEnum.Pause
        });


    }

    @action
    editRemark = async () => {
        this.editRemarkLoading = true
        try {
            await this.api.task.editTask({
                taskId: this.selectTask.id,
                remark: this.editRemarkValue
            })
        } catch (e) {
            runInAction('HIDE_EDIT_REMARK_LOADING', () => {
                this.editRemarkLoading = false
            })
            return;
        }
        runInAction('HIDE_EDIT_REMARK_LOADING', () => {
            this.editRemarkLoading = false
        })
        this.props.setTaskAttr(this.selectTask, {
            remark: this.editRemarkValue
        });
        this.toggleRemarkModalVisible();
    }

    /**
     * 下载Subdata
     */
    downSubdata = (task: ITaskStore.ITaskForList) => {
        window.open(task.split_data_url, '_target');
    }


    componentDidMount() {
        // 读取task列表
        this.props.getTaskList()
    }

    render() {
        const {
            scrollY,
            getTaskLoading,
            taskList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <div className={styles.taskTable}>
                <Table<ITaskStore.ITaskForList>

                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    locale={{ emptyText: 'No Data' }}
                    loading={getTaskLoading}
                    dataSource={taskList}
                    scroll={{ y: scrollY, x: '140%' }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ITaskStore.ITaskForList> key="id" title="ID" dataIndex="id" width={100} />
                    <Table.Column<ITaskStore.ITaskForList> key="task_name" title="Task Name" dataIndex="task_name" width={200} />
                    <Table.Column<ITaskStore.ITaskForList> key="ige_pkgname" title="IGE Pkgname" dataIndex="ige_pkgname" width={200} />
                    <Table.Column<ITaskStore.ITaskForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                    <Table.Column<ITaskStore.ITaskForList> key="scene_name" title="Scene Name" dataIndex="scene_name" width={200} />
                    <Table.Column<ITaskStore.ITaskForList> key="geo" title="GEO" dataIndex="geo" width={100} />
                    <Table.Column<ITaskStore.ITaskForList> key="date" title="Task Date" dataIndex="date" width={200}
                    render={(_)=>(
                        <Tooltip placement="leftBottom" title={_}>
                            <div title={_} className={styles.colClass}>{_}</div>
                        </Tooltip>
                    )}
                    />
                    <Table.Column<IAccountStore.IAccount>
                        key="task_process_status"
                        title="Status"
                        dataIndex="task_process_status"
                        width={100}
                        render={(_) => (
                            // statusOption.find(item => item.value === _).key
                            statusEnum[_]
                        )}
                    />
                    <Table.Column<ITaskStore.ITaskForList> key="pkg_name" title="Pkgname" dataIndex="pkg_name" width={200} 
                     render={(_) => (
                        _ ? _ : '-'
                    )}
                    />
                    <Table.Column<ITaskStore.ITaskForList> key="priority" title="Priority" dataIndex="priority" width={100} />
                    <Table.Column<ITaskStore.ITaskForList>
                        key="remark"
                        title="Remark"
                        dataIndex="remark"
                        width={200}
                        render={(_, task) => (
                            <div style={{'display':'flex'}}>
                                <div>
                                    <Tooltip placement="leftBottom" title={_}>
                                        <div className={styles.colClass}>{_}</div>
                                    </Tooltip>
                                </div>
                                <a className={styles.remarkBtn} onClick={() => this.showEditRemarkModal(task)}>
                                    <Icon type="edit" theme="filled" />
                                </a>
                            </div>
                        )}
                    />
                    <Table.Column<ITaskStore.ITaskForList> key="add_time" title="Add Time" dataIndex="add_time" width={200} />
                    <Table.Column<ITaskStore.ITaskForList> key="update_time" title="Update Time" dataIndex="update_time" width={200} />

                    <Table.Column<ITaskStore.ITaskForList>
                        key="action"
                        title="Operate"
                        width={150}
                        fixed="right"
                        render={(_, record) => (
                            <span>
                                {
                                    (record.task_process_status === statusEnum.Pause)
                                        ? (<button className={styles.linkBtn} key='play' onClick={() => this.startTask(record)}>
                                            <Icon type="play-circle" theme="filled" />
                                        </button>)
                                        : (<button className={styles.linkBtn} key='pause' disabled={record.task_process_status === statusEnum.Finished} onClick={() => this.pauseTask(record)}>
                                            <Icon type="pause-circle" theme="filled" />
                                        </button>)
                                }
                                {
                                    (<Divider key='Divider' type="vertical" />)
                                }
                                {
                                    (<button className={styles.linkBtn} key='subdata' disabled={record.task_process_status !== statusEnum.Finished} onClick={() => this.downSubdata(record)}>
                                        <Icon type="file" theme="filled" />
                                    </button>)
                                }
                                {
                                    (<Divider key='Divider2' type="vertical" />)
                                }
                                {
                                    (<button className={styles.linkBtn} key='scene' onClick={() => this.showSceneImage(record)}>
                                        <Icon type="file-image" theme="filled" />
                                    </button>)
                                }
                            </span>
                        )}
                    />
                </Table>
                <Modal
                    title="Edit"
                    width="350px"
                    footer={null}
                    visible={this.modalVisible}
                    onCancel={this.toggleRemarkModalVisible}
                >
                    <Row>
                        <Col span={4}>
                            <label htmlFor="remarkInput">Remark</label>
                        </Col>
                        <Col span={20}>
                            <Input.TextArea
                                id="remarkInput"
                                autosize={{ minRows: 3 }}
                                style={{ width: '100%' }}
                                onChange={this.remarkInputChange}
                                value={this.editRemarkValue}
                            />
                        </Col>
                        <Col span={24} style={{ marginTop: '15px', textAlign: 'right' }}>
                            <Button type="primary" onClick={this.editRemark} loading={this.editRemarkLoading}>Save</Button>
                        </Col>
                    </Row>

                </Modal>
            </div>
        )
    }
}

export default AppGroupTable
