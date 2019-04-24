import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'

interface IStoreProps {
    getPermissionsloading?: boolean
    permissions?: IPermissionStore.IPermission[]
    setPermission?: (permission: IPermissionStore.IPermission) => void
    getPermissions?: () => Promise<any>
    deletePermission?: (id: number) => Promise<any>
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
        const { routerStore, permissionStore } = store
        const {
            getPermissionsloading,
            permissions,
            getPermissions,
            deletePermission,
            handleTableChange,
            page,
            pageSize,
            total,
            setPermission
        } = permissionStore
        return { routerStore, setPermission, getPermissionsloading, permissions, getPermissions, deletePermission, handleTableChange, page, pageSize, total }
    }
)
@observer
class PermissionTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private delPermission: IPermissionStore.IPermission = {}

    @action
    hidePermissionModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }


    @action
    modifyPermission = (permission: IPermissionStore.IPermission) => {
        this.props.setPermission(permission)
        this.props.routerStore.replace(`/permission/edit/${permission.id}`)
    }

    componentDidMount() {
        this.props.getPermissions()
    }
    @action
    deleteModel = (permission: IPermissionStore.IPermission) => {
        this.delPermission = permission
        this.hidePermissionModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deletePermission(this.delPermission.id)
        message.success(data.message)
        this.hidePermissionModalVisible()
    }

    render() {
        const {
            scrollY,
            getPermissionsloading,
            permissions,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Modal
                    title="Delete"
                    width={400}
                    visible={this.modalVisible}
                    onCancel={this.hidePermissionModalVisible}
                    // onOk={() => deletePermission(this.delPermission.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hidePermissionModalVisible}>No</Button>
                    ]}
                >

                    <p> Sure to delete {this.delPermission.name}?</p>
                </Modal>

                <Table<IPermissionStore.IPermission>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getPermissionsloading}
                    dataSource={permissions}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IPermissionStore.IPermission> key="name" title="Permission Name" dataIndex="name" width={150} />
                    <Table.Column<IPermissionStore.IPermission> key="id" title="id" dataIndex="id" width={100} />
                    <Table.Column<IPermissionStore.IPermission> key="route" title="route" dataIndex="route" width={250} />
                    <Table.Column<IPermissionStore.IPermission>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                <a href="javascript:;" onClick={() => this.modifyPermission(record)}>
                                    <Icon type="form" />
                                </a>
                                <Divider type="vertical" />

                                <a href="javascript:;" onClick={() => this.deleteModel(record)}>
                                    <MyIcon type='iconshanchu' />
                                </a>
                            </span>
                        )}
                    />
                </Table >
            </React.Fragment >
        )
    }
}

export default PermissionTable
