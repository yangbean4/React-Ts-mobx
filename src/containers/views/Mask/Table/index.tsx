import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
// import { statusOption } from '../default.config'
import MaskModal from '../MaskModal'
import { FormatNumber } from '@utils/transRender'
import MyIcon from '@components/Icon'

interface IStoreProps {
    getMaskLoading?: boolean
    maskList?: IMaskSubsiteStore.IMask[]
    getMasks?: () => Promise<any>
    getOptionListDb?: () => Promise<any>
    deleteMask?: (id: number | string) => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { maskStore } = store
        const {
            getMaskLoading,
            maskList,
            getMasks,
            deleteMask,
            handleTableChange,
            page,
            pageSize,
            getOptionListDb,
            total,
        } = maskStore
        return { getOptionListDb, getMaskLoading, maskList, getMasks, deleteMask, handleTableChange, page, pageSize, total }
    }
)
@observer
class MaskTable extends ComponentExt<IProps> {

    @observable
    private delModalVisible: boolean = false

    @observable
    private maskModalVisible: boolean = false

    @observable
    private delMask: IMaskSubsiteStore.IMask = {}

    @observable
    private currentMask: IMaskSubsiteStore.IMask = null

    @action
    hideDelModalVisible = () => {
        this.delModalVisible = !this.delModalVisible
    }


    @action
    modifyMask = (mask: IMaskSubsiteStore.IMask) => {
        this.currentMask = {
            ...mask,
            subsite_ids: (mask.subsite_ids as string).split(',')
        }
        this.maskModalVisible = true
    }
    @action
    hideMaskModalVisible = () => {
        this.maskModalVisible = !this.maskModalVisible
    }

    componentDidMount() {
        this.props.getMasks()
        this.props.getOptionListDb()
    }
    @action
    deleteModel = (mask: IMaskSubsiteStore.IMask) => {
        this.delMask = mask
        this.hideDelModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteMask(this.delMask.id)
        message.success(data.message)
        this.hideDelModalVisible()
    }

    render() {
        const {
            scrollY,
            getMaskLoading,
            maskList,
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
                    // onOk={() => deleteMask(this.delMask.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideDelModalVisible}>No</Button>
                    ]}
                >

                    <p>Confirm to delete it?</p>
                </Modal>

                <Table<IMaskSubsiteStore.IMask>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getMaskLoading}
                    dataSource={maskList}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IMaskSubsiteStore.IMask> key="app_key" title="Appkey" dataIndex="app_key" width={200} />
                    <Table.Column<IMaskSubsiteStore.IMask> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                    <Table.Column<IMaskSubsiteStore.IMask>
                        key="pkg_name"
                        title="Pkg Name"
                        dataIndex="pkg_name"
                        width={200}
                        render={
                            (_, record) => (
                                <span>
                                    <Popover
                                        placement="top"
                                        trigger="click"
                                        content={
                                            Object.entries(record.pkg_name_list || {}).map(([key, value]) => {
                                                return (<span style={{ display: 'block' }} key={key}>
                                                    {key}-{value}
                                                </span>)
                                            })
                                        }
                                    >
                                        <a href="javascript:;">
                                            {FormatNumber(record.pkg_name_num)}
                                        </a>
                                    </Popover>
                                </span>
                            )
                        }
                    />
                    <Table.Column<IMaskSubsiteStore.IMask> key="mask_id" title="Mask Subsite" dataIndex="mask_id" width={200} />
                    <Table.Column<IMaskSubsiteStore.IMask> key="update_time" title="Update Time" dataIndex="update_time" width={200} />
                    <Table.Column<IMaskSubsiteStore.IMask>
                        key="action"
                        title="Operate"
                        width={200}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Mask Subsite-Edit', [
                                        <a href="javascript:;" key='btn-edit' onClick={() => this.modifyMask(record)}>
                                            <Icon type="form" />
                                        </a>
                                    ])
                                }
                                &nbsp;&nbsp;
                                {
                                    this.$checkAuth('Offers-Mask Subsite-Delete', (
                                        <a href="javascript:;" onClick={() => this.deleteModel(record)}>
                                            <Icon type='delete' />
                                        </a>
                                    ))
                                }
                            </span>
                        )}
                    />
                </Table >
                <MaskModal
                    visible={this.maskModalVisible}
                    onCancel={this.hideMaskModalVisible}
                    mask={this.currentMask}
                />
            </React.Fragment >
        )
    }
}

export default MaskTable
