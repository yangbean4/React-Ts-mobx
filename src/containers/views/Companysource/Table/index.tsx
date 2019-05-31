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
    getCompanyloading?: boolean
    companys?: ICompanyStore.ICompany[]
    setCompany?: (user: IUserStore.IUser) => void
    getCompanys?: () => Promise<any>
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
        const { routerStore, companyStore } = store
        const {
            getCompanyloading,
            setCompany,
            getCompanys,
            companys,
            handleTableChange,
            page,
            pageSize,
            total
        } = companyStore
        return { routerStore, getCompanyloading, setCompany, getCompanys, companys, handleTableChange, page, pageSize, total }
    }
)
@observer
class AdsourceTable extends ComponentExt<IProps> {

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
        this.props.setCompany(user)
        this.props.routerStore.replace(`/Company/edit/${user.id}`)
    }

    componentDidMount() {
        this.props.getCompanys()
    }
    @action
    deleteModel = (user: IUserStore.IUser) => {
        this.delUser = user
        this.hideUserModalVisible()
    }
   
    render() {
        const {
            scrollY,
            getCompanyloading,
            companys,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                {/* <Modal
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
                </Modal> */}
                <Table<IUserStore.IUser>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getCompanyloading}
                    dataSource={companys}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IUserStore.IUser> key="User name" title="User Name" dataIndex="User Name" width={100} />
                    <Table.Column<IUserStore.IUser> key="Source Company" title="Source Company" dataIndex="Source Company" width={200} />
                    <Table.Column<IUserStore.IUser> key="Role" title="Role" dataIndex="Role" width={100} />
                    <Table.Column<IUserStore.IUser> key="Account Type" title="Account Type" dataIndex="Account Type" width={100} />
                    <Table.Column<IUserStore.IUser> key="Status" title="Status" dataIndex="Status" width={100} />
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

export default AdsourceTable
