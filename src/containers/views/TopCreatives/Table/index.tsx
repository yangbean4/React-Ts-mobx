import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import * as styles from '../index.scss'
import TopCreativesModal from '../TopCreativesModal'

interface IStoreProps {
    getTopCreativeLoading?: boolean
    topCreativeList?: ITopCreativeStore.ITopCreativeForList[]
    setCreative?: (creative: ICreativeStore.ICreative) => void
    getTopCreative?: () => Promise<any>
    deleteCreative?: (id: number) => Promise<any>
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
        const { routerStore, topCreativeStore } = store
        const {
            getTopCreativeLoading,
            topCreativeList,
            getTopCreative,
            handleTableChange,
            page,
            pageSize,
            total,
            setCreative
        } = topCreativeStore
        return { routerStore, setCreative, getTopCreativeLoading, topCreativeList, getTopCreative, handleTableChange, page, pageSize, total }
    }
)
@observer
class TopCreativesTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false

    @observable
    private previewData: ITopCreativeStore.ITopCreativeForList = {} as ITopCreativeStore.ITopCreativeForList

    @action
    hideCreativeModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyCreative = (creative: ITopCreativeStore.ITopCreativeForList) => {
        runInAction('SET_', () => {
            this.previewData = creative
        })
        setImmediate(() => {
            this.hideCreativeModalVisible()
        })
    }

    expandedRowRender = (record: ITopCreativeStore.ITopCreativeForList) => {
        return <Table<ITopCreativeStore.ICampaignForList>
            className={'center-table ' + styles.expantTable}
            style={{ width: '100%' }}
            // size="middle"
            rowKey='app_key'
            bordered={false}
            locale={{ emptyText: 'No Data' }}
            showHeader={false}
            dataSource={record.campaign}
            pagination={false}
        >
            <Table.Column<ITopCreativeStore.ICampaignForList> title="Campaign ID Name" dataIndex="campaign_id_name" />
            <Table.Column<ITopCreativeStore.ICampaignForList> title="Impression" dataIndex="impression" fixed="right" width={100} />
            <Table.Column<ITopCreativeStore.ICampaignForList> title="CTR" dataIndex="ctr" fixed="right" width={80} />
            <Table.Column<ITopCreativeStore.ICampaignForList> title="CVR" dataIndex="cvr" fixed="right" width={80} />
            <Table.Column<ITopCreativeStore.ICampaignForList> title="IPM" dataIndex="ipm" fixed="right" width={80} />
            <Table.Column<ITopCreativeStore.ICampaignForList> key="action" title="Preview" fixed="right" width={100} />
        </Table>
    }

    componentDidMount() {
        this.props.getTopCreative()
    }

    render() {
        const {
            scrollY,
            getTopCreativeLoading,
            topCreativeList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <TopCreativesModal
                    visible={this.modalVisible}
                    onCancel={this.hideCreativeModalVisible}
                    data={this.previewData}
                />

                <Table<ITopCreativeStore.ITopCreativeForList>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    // size="middle"
                    rowKey={record => record.creative_id + record.endcard_id + record.app_id}
                    locale={{ emptyText: 'No Data' }}
                    loading={getTopCreativeLoading}
                    dataSource={topCreativeList}
                    scroll={{ y: scrollY, x: 1680 }}
                    expandedRowRender={this.expandedRowRender}
                    // childrenColumnName="campaign"
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> key="rank" title="Rank" render={(_, record, index) => index + 1} width={80} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative Type" dataIndex="creative_type_name" width={130} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative ID" dataIndex="creative_id" width={100} />

                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative" dataIndex="creative" width={100} render={(_, record) => record.creative == '--' ? '--' : <img src={record.creative} />} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Endcard ID" dataIndex="endcard_id" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Endcard" dataIndex="endcard" width={100} render={(_, record) => record.endcard == '--' ? '--' : <img src={record.endcard} />} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="App ID" dataIndex="app_id" width={250} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Platform" dataIndex="platform" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Data Duration" dataIndex="data_duration" width={200} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Campaign" dataIndex="campaign_num" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Impression" dataIndex="impression" fixed="right" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="CTR" dataIndex="ctr" fixed="right" width={80} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="CVR" dataIndex="cvr" fixed="right" width={80} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="IPM" dataIndex="ipm" fixed="right" width={80} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList>
                        key="action"
                        title="Preview"
                        width={80}
                        fixed="right"
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Creatives-Creatives-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyCreative(record)}>
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

export default TopCreativesTable
