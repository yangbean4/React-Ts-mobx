import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
// import { statusOption } from '../default.config'
import CustomModal from '../CustomModal'

const statusOption = [
    {
        key: 'Enable',
        value: 1
    },
    {
        key: 'Disabled',
        value: 0
    }
]

interface IStoreProps {
    getCustomsloading?: boolean
    customs?: ICustomStore.ICustom[]
    getCustoms?: () => Promise<any>
    deleteCustom?: (id: number) => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    getSidebar?: () => Promise<any>

}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { customStore, authStore } = store
        const {
            getCustomsloading,
            customs,
            getCustoms,
            deleteCustom,
            handleTableChange,
            page,
            pageSize,
            total,
        } = customStore
        const { getSidebar } = authStore
        return { getSidebar, getCustomsloading, customs, getCustoms, deleteCustom, handleTableChange, page, pageSize, total }
    }
)
@observer
class CustomTable extends ComponentExt<IProps> {

    @observable
    private delModalVisible: boolean = false

    @observable
    private customModalVisible: boolean = false

    @observable
    private delCustom: ICustomStore.ICustom = {}

    @observable
    private currentCustom: ICustomStore.ICustom = null

    @action
    hideDelModalVisible = () => {
        this.delModalVisible = !this.delModalVisible
    }


    @action
    modifyCustom = (custom: ICustomStore.ICustom) => {
        this.currentCustom = custom
        this.customModalVisible = true
    }
    @action
    hideCustomModalVisible = () => {
        this.customModalVisible = !this.customModalVisible
    }

    componentDidMount() {
        this.props.getCustoms()
    }
    @action
    deleteModel = (custom: ICustomStore.ICustom) => {
        this.delCustom = custom
        this.hideDelModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteCustom(this.delCustom.id)
        message.success(data.message)
        this.props.getSidebar()
        this.hideDelModalVisible()
    }

    render() {
        const {
            scrollY,
            getCustomsloading,
            customs,
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
                    visible={this.delModalVisible}
                    onCancel={this.hideDelModalVisible}
                    // onOk={() => deleteCustom(this.delCustom.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideDelModalVisible}>No</Button>
                    ]}
                >

                    <p> Sure to delete {this.delCustom.primary_name}?</p>
                </Modal>

                <Table<ICustomStore.ICustom>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getCustomsloading}
                    dataSource={customs}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ICustomStore.ICustom> key="primary_name" title="Primary Name" dataIndex="primary_name" width={200} />
                    <Table.Column<ICustomStore.ICustom>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={200}
                        render={(_) => (
                            statusOption.find(item => item.value === _).key
                        )}
                    />
                    <Table.Column<ICustomStore.ICustom>
                        key="action"
                        title="Operate"
                        width={200}
                        render={(_, record) => (
                            <span>
                                <a href="javascript:;" onClick={() => this.modifyCustom(record)}>
                                    <Icon type="form" />
                                </a>
                                {/* <Divider type="vertical" />
                                <a href="javascript:;" onClick={() => this.deleteModel(record)}>
                                    <MyIcon type='iconshanchu' />
                                </a> */}
                            </span>
                        )}
                    />
                </Table >
                <CustomModal
                    visible={this.customModalVisible}
                    onCancel={this.hideCustomModalVisible}
                    custom={this.currentCustom}
                />
            </React.Fragment >
        )
    }
}

export default CustomTable
