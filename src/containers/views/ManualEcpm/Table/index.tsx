import * as React from 'react'
import { Table, Icon, Modal } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
const { confirm } = Modal;
interface IStoreProps {
    manualLoading?: boolean
    manualList?: IManualEcpmStore.IList[]
    getManualList?: () => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
    deleteManual?: (data) => Promise<any>
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, manualEcpmStore } = store
        const {
            getManualList,
            handleTableChange,
            page,
            pageSize,
            total,
            manualList,
            deleteManual
        } = manualEcpmStore
        return { deleteManual, routerStore, getManualList, manualList, handleTableChange, page, pageSize, total }
    }
)
@observer
class CampaignsTable extends ComponentExt<IProps> {

    modifyComment = (campaign: IManualEcpmStore.IList) => {
        this.props.routerStore.push(`/manual/edit/${campaign.id}`)
    }

    delete = (campaign: IManualEcpmStore.IList) => {
        let id = campaign.campaign_id;
        let that = this;
        confirm({
            title: 'Confirm to delete it?',
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk() {
                that.props.deleteManual(campaign.id)
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }
    // 去请求数据
    componentDidMount() {
        // const companyType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        // if (companyType !== this.commentType) {
        //     runInAction('SET_TYPE', () => {
        //         this.commentType = companyType
        //     })
        // }
        // this.props.setCampaignType(companyType)
    }
    hideModal() {

    }
    render() {
        const {
            scrollY,
            handleTableChange,
            page,
            pageSize,
            total,
            manualList,
            manualLoading,
            deleteManual
        } = this.props
        return (
            <React.Fragment>
                <Table<IManualEcpmStore.IList>
                    className="center-table"
                    style={{ width: '100%', wordBreak: 'break-all' }}
                    bordered
                    rowKey="id"
                    loading={manualLoading}
                    dataSource={manualList}
                    scroll={{ y: scrollY, x: 1860 }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IManualEcpmStore.IList> key="app_id" title="App ID" dataIndex="app_id" width={180} />
                    <Table.Column<IManualEcpmStore.IList> key="campaign_id" title="Campaign ID" dataIndex="campaign_id" width={120} />
                    <Table.Column<IManualEcpmStore.IList> key="campaign_name" title="Campaign Name" dataIndex="campaign_name" width={150} />
                    <Table.Column<IManualEcpmStore.IList> key="country" title="GEO" dataIndex="country" width={200} />
                    <Table.Column<IManualEcpmStore.IList> key="pkg_name" title="Pkg Name" dataIndex="pkg_name" width={200} />
                    <Table.Column<IManualEcpmStore.IList> key="pid" title="PID" dataIndex="pid" width={200} />

                    <Table.Column<IManualEcpmStore.IList> key="placement_name" title="Placement Name" dataIndex="placement_name" width={200} />
                    <Table.Column<IManualEcpmStore.IList> key="pid_type_name" title="PID Type" dataIndex="pid_type_name" width={200} />
                    <Table.Column<IManualEcpmStore.IList> key="cpm" title="Manual eCPM($)" dataIndex="cpm" width={200} />
                    <Table.Column<IManualEcpmStore.IList> key="update_time" title="Update Time" dataIndex="update_time" width={200} />
                    <Table.Column<IManualEcpmStore.IList>
                        key="action"
                        title="Operate"
                        fixed='right'
                        width={100}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Campaigns-Manual eCPM-Edit', [
                                        <a key='form' href="javascript:;" onClick={() => this.modifyComment(record)}>
                                            <Icon type="form" />
                                        </a>
                                    ])
                                }
                                &nbsp;&nbsp;
                                {
                                    this.$checkAuth('Offers-Campaigns-Manual eCPM-Delete', [
                                        <a key='form' href="javascript:;" onClick={() => this.delete(record)}>
                                            <Icon type="delete" />
                                        </a>
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

export default CampaignsTable
