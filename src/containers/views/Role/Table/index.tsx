import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'

interface IStoreProps {
    getRolesloading?: boolean
    roles?: IRoleStore.IRole[]
    setRole?: (role: IRoleStore.IRole) => void
    getRoles?: () => Promise<any>
    deleteRole?: (id: number) => Promise<any>
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
        const { routerStore, roleStore } = store
        const {
            getRolesloading,
            roles,
            getRoles,
            deleteRole,
            handleTableChange,
            page,
            pageSize,
            total,
            setRole
        } = roleStore
        return { routerStore, setRole, getRolesloading, roles, getRoles, deleteRole, handleTableChange, page, pageSize, total }
    }
)
@observer
class RoleTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private delRole: IRoleStore.IRole = {}

    @action
    hideRoleModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }


    @action
    modifyRole = (role: IRoleStore.IRole) => {
        this.props.setRole(role)
        this.props.routerStore.replace(`/role/edit/${role.id}`)
    }

    componentDidMount() {
        this.props.getRoles()
    }
    @action
    deleteModel = (role: IRoleStore.IRole) => {
        this.delRole = role
        this.hideRoleModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteRole(this.delRole.id)
        message.success(data.message)
        this.hideRoleModalVisible()
    }

    render() {
        const {
            scrollY,
            getRolesloading,
            roles,
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
                    onCancel={this.hideRoleModalVisible}
                    // onOk={() => deleteRole(this.delRole.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideRoleModalVisible}>No</Button>
                    ]}
                >

                    <p> Sure to delete {this.delRole.role_name},Contains the account {(this.delRole.user_detail || []).join(',')}?</p>
                </Modal>

                <Table<IRoleStore.IRole>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getRolesloading}
                    dataSource={roles}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IRoleStore.IRole> key="role_name" title="Role Name" dataIndex="role_name" width={200} />
                    <Table.Column<IRoleStore.IRole>
                        key="user_count"
                        title="User"
                        width={200}
                        dataIndex="user_count"
                        render={(_, record) => (
                            <span>
                                <Popover placement="top" trigger="click" content={record.user_detail.map(item => (<span style={{ marginRight: '6px', marginLeft: '6px' }} key={item}>{item}</span>))}>
                                    <a href="javascript:;">
                                        {_}
                                    </a>
                                </Popover>
                            </span>

                        )
                        }
                    />
                    <Table.Column<IRoleStore.IRole > key="remarks" title="Remarks" dataIndex="remarks" width={100} />
                    <Table.Column<IRoleStore.IRole>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Authorization-Role Manage-Edit', [
                                        <a key='form' href="javascript:;" onClick={() => this.modifyRole(record)}>
                                            <Icon type="form" />
                                        </a>,
                                        <Divider key='Divider' type="vertical" />
                                    ])
                                }
                                {
                                    this.$checkAuth('Authorization-Role Manage-Delete', (
                                        <a href="javascript:;" onClick={() => this.deleteModel(record)}>
                                            <MyIcon type='iconshanchu' />
                                        </a>
                                    ))
                                }

                            </span>
                        )}
                    />
                </Table >
            </React.Fragment >
        )
    }
}

export default RoleTable
