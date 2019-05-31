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
    getUsersloading?: boolean
    users?: IUserStore.IUser[]
    setUser?: (user: IUserStore.IUser) => void
    getUsers?: () => Promise<any>
    deleteUser?: (id: number) => Promise<any>
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
        const { routerStore, userStore } = store
        const {
            getUsersloading,
            users,
            getUsers,
            deleteUser,
            handleTableChange,
            page,
            pageSize,
            total,
            setUser
        } = userStore
        return { routerStore, setUser, getUsersloading, users, getUsers, deleteUser, handleTableChange, page, pageSize, total }
    }
)
@observer
class CompanyTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private delUser: IUserStore.IUser = {}

    @action
    hideUserModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }


    @action
    modifyUser = (user: IUserStore.IUser) => {
        this.props.setUser(user)
        this.props.routerStore.replace(`/users/edit/${user.id}`)
    }

    componentDidMount() {
        this.props.getUsers()
    }
    @action
    deleteModel = (user: IUserStore.IUser) => {
        this.delUser = user
        this.hideUserModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteUser(this.delUser.id)
        message.success(data.message)
        this.hideUserModalVisible()
    }

    render() {
        const {
            scrollY,
            getUsersloading,
            users,
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
                    onCancel={this.hideUserModalVisible}
                    // onOk={() => deleteUser(this.delUser.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideUserModalVisible}>No</Button>
                    ]}
                >
                    <p> Sure to delete {this.delUser.user_name}</p>
                </Modal>
                <Table<IUserStore.IUser>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getUsersloading}
                    dataSource={users}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IUserStore.IUser> key="company" title="company" dataIndex="company" width={100} />
                    <Table.Column<IUserStore.IUser> key="FullName" title="Full Name Of Company" dataIndex="owner" width={200} />
                    <Table.Column<IUserStore.IUser>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Authorization-User Manage-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyUser(record)}>
                                            {`Edit`}
                                        </a>)
                                    ])
                                }
                                {
                                    this.$checkAuth('Authorization-User Manage-Edit&Authorization-User Manage-Delete')
                                }
                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}

export default CompanyTable
