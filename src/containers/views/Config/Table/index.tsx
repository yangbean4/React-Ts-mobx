import * as React from 'react'
import { Table, Divider, Icon, Popover, message, Button, Modal } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import UseModal from './useModel'
import { useType } from './useType'
import PortalsBtn from '@components/portalsBtn'
import { FormatNumber } from '@utils/transRender'
interface IStoreProps {
    getConfigLoading?: boolean
    configsList?: IConfigStore.IConfig[]
    getConfigsList?: () => Promise<any>
    deleteConfig?: (id: number) => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
    setTargetConfig?: (con?: IConfigStore.IConfigTarget) => void
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, configStore } = store
        const {
            getConfigLoading,
            configsList,
            getConfigsList,
            deleteConfig,
            handleTableChange,
            page,
            pageSize,
            total,
            setTargetConfig
        } = configStore
        return {
            routerStore,
            configsList,
            setTargetConfig,
            getConfigsList, getConfigLoading, deleteConfig, handleTableChange, page, pageSize, total
        }
    }
)


@observer
class ConfigTable extends ComponentExt<IProps> {

    private delParom = {
        config_deploy_id: '',
        pkg_name: '',
        nameArr: []
    }

    @observable
    private modalVisible: boolean = false

    @observable
    private targetConfig: IConfigStore.IConfig = {}

    // get targetConfig(): IConfigStore.IConfig {
    //     return this._targetConfig
    // }
    // set targetConfig(targetConfig) {
    //     this._targetConfig = targetConfig
    //     this.props.setTargetConfig(targetConfig)
    // }

    @observable
    private delModalVisible: boolean = false

    @observable
    private modelType: useType

    @action
    hideConfigModalsVisible = () => {
        this.modalVisible = !this.modalVisible
    }


    @action
    hideRoleModalVisible = () => {
        this.delModalVisible = !this.delModalVisible
    }


    componentDidMount() {
        this.props.getConfigsList()
    }

    @action
    handelOk = (data) => {
        const { id, copyTo, pkg_name } = data;
        switch (this.modelType) {
            case 'delete':
                this.delParom = {
                    config_deploy_id: id.join(','),
                    pkg_name: this.targetConfig.pkg_name || pkg_name,
                    nameArr: id.map(ele => this.targetConfig.versionArr.find(ver => ver.id === ele).version)
                }
                this.hideRoleModalVisible()
                break;
            case 'copy':
                this.setTargetConfig({ ...this.targetConfig, config_version: copyTo, is_duplicate: 1 })
                this.goEdit(id, copyTo ? `?copyTo=${copyTo}` : undefined)
                break;
            case 'edit':
                this.setTargetConfig(this.targetConfig, id)
                this.goEdit(id)
                break;
            case 'add':
                this.setTargetConfig(data)
                this.props.routerStore.push(`/config/add`)
                break;
        }

        this.hideConfigModalsVisible()
    }

    deleteConfig = async (data) => {
        const res = await this.props.deleteConfig(data)
        message.success(res.message)
    }

    @action
    viewModel(type: useType, config?: IConfigStore.IConfig) {
        this.modelType = type;
        this.targetConfig = config || {};
        this.hideConfigModalsVisible()
    }

    @action
    setTargetConfig(config, id?) {
        const { pkg_name, platform, config_version, versionArr = [], is_duplicate = 0 } = config
        const ver = id === undefined ? undefined : versionArr.find(item => item.id === id).version
        const gg = {
            is_duplicate,
            pkg_name, platform, config_version: ver || config_version, config_deploy_id: id ? Number(id) : id
        }
        this.props.setTargetConfig(gg)
        localStorage.setItem('TargetConfig', JSON.stringify(gg))
    }

    @action
    handelEdit(config, id) {
        this.setTargetConfig(config, id)
        this.goEdit(id)
    }

    goEdit(id, query?) {
        this.props.routerStore.push(`/config/edit/${id}` + (query || ''))
    }

    handelDel = () => {
        const { config_deploy_id, pkg_name } = this.delParom
        this.deleteConfig({ config_deploy_id, pkg_name })
        this.hideRoleModalVisible()
    }

    render() {
        const {
            scrollY,
            configsList,
            getConfigLoading,
            handleTableChange,
            page,
            pageSize,
            total,
        } = this.props
        return (
            <React.Fragment>
                <Modal
                    title="Delete"
                    width={400}
                    visible={this.delModalVisible}
                    onCancel={this.hideRoleModalVisible}
                    // onOk={() => deleteRole(this.delRole.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelDel}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideRoleModalVisible}>No</Button>
                    ]}
                >
                    {
                        this.delParom.nameArr.length === (this.targetConfig.versionArr || []).length ?
                            <p> Sure to delete all of the config version for the pkgname?</p>
                            : <p> Sure to delete {this.delParom.nameArr.join(',')}?</p>
                    }

                </Modal>
                <UseModal
                    type={this.modelType}
                    visible={this.modalVisible}
                    targetConfig={this.targetConfig}
                    onCancel={this.hideConfigModalsVisible}
                    onOk={this.handelOk}
                />
                {
                    this.$checkAuth('Config Manage-Config Manage-Add', (
                        <PortalsBtn querySelector='#insertBeforeConfigSearch'>
                            <Button icon='plus' type="primary" onClick={() => this.viewModel('add')}>
                                Add
                                </Button>
                        </PortalsBtn>

                    ))
                }
                <Table<IConfigStore.IConfig>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey={(row) => row.pkg_name + row.platform}
                    loading={getConfigLoading}
                    dataSource={configsList}
                    scroll={{
                        y: scrollY
                    }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IConfigStore.IConfig> key="pkg_name" title="Pkg Name" dataIndex="pkg_name" width={200} />
                    <Table.Column<IConfigStore.IConfig> key="bundle_id" title="Bundle ID" dataIndex="bundle_id" width={200} />
                    <Table.Column<IConfigStore.IConfig> key="platform" title="Platform" dataIndex="platform" width={200} />
                    <Table.Column<IConfigStore.IConfig>
                        key="totalConfig"
                        title="Config Version Number"
                        width={200}
                        dataIndex="totalConfig"
                        render={(_, record) => (
                            <span>
                                <Popover
                                    placement="top"
                                    trigger="click"
                                    content={record.versionArr.map(
                                        item => {
                                            return this.$checkAuth('Config Manage-Config Manage-Edit') ?
                                                <span
                                                    style={{ marginRight: '6px', marginLeft: '6px' }}
                                                    onClick={() => this.handelEdit(record, item.id)}
                                                    key={item.id}>
                                                    <a href="javascript:;">
                                                        {item.version}
                                                    </a>
                                                </span>
                                                : <span
                                                    style={{ marginRight: '6px', marginLeft: '6px' }}
                                                    key={item.id}>
                                                    <a href="javascript:;">
                                                        {item.version}
                                                    </a>
                                                </span>
                                        }
                                    )}>
                                    <a href="javascript:;">
                                        {FormatNumber(_)}
                                    </a>
                                </Popover>
                            </span>

                        )
                        }
                    />
                    <Table.Column<IConfigStore.IConfig>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Config Manage-Config Manage-Edit', [
                                        <a href="javascript:;" key='btn-edit' onClick={() => this.viewModel('edit', record)}>
                                            <Icon type="form" />
                                        </a>,
                                    ])
                                }

                                {
                                    this.$checkAuth('Config Manage-Config Manage-Add|Config Manage-Config Manage-Delete', (
                                        <Divider key='Divider1' type="vertical" />
                                    ))
                                }


                                {
                                    this.$checkAuth('Config Manage-Config Manage-Add', [
                                        <a href="javascript:;" key='copy' onClick={() => this.viewModel('copy', record)}>
                                            <MyIcon type="iconfuzhi" />
                                        </a>,
                                    ])
                                }

                                {
                                    this.$checkAuth('Config Manage-Config Manage-Add&Config Manage-Config Manage-Delete', (
                                        <Divider key='Divider2' type="vertical" />
                                    ))
                                }
                                {
                                    this.$checkAuth('Config Manage-Config Manage-Delete', (
                                        <a href="javascript:;" onClick={() => this.viewModel('delete', record)}>
                                            <MyIcon type='iconshanchu' />
                                        </a>
                                    ))
                                }

                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}
export default ConfigTable