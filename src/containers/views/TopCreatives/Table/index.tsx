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
    /**
     * 自定义展开图标
     */
    CustomExpandIcon = (props) => {
        if ('campaign_id_name' in props.record) {
            return null;
        }
        return (
            <Icon type={props.expanded ? 'up' : 'down'}
                className='expand-icon'
                style={{ fontSize: '10px', color: '#9A97AE' }}
                onClick={e => props.onExpand(props.record, e)} />
        );
    }

    /**
     * 重写表格渲染组件
     */
    cellComponent = (props) => {
        const { children, ...restProps } = props
        // 如果这个表格是 Campaign 则将里面的内容用新div包裹
        if (props.className === styles.expantCell) {
            return <td {...restProps}>
                <div className='content'>{children}</div>
            </td>
        }
        return <td {...restProps}>{children}</td>
    }

    formatNumber = (num) => {
        return `${num}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }


    componentDidMount() {
        this.props.getTopCreative()
    }

    render() {
        const tableComponent = {
            body: {
                cell: this.cellComponent
            }
        }
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
                    rowKey={record => 'campaign_id_name' in record ? '' + record['campaign_id_name'] + record['ipm'] : '' + record.creative_id + record.endcard_id + record.ids}
                    locale={{ emptyText: 'No Data' }}
                    loading={getTopCreativeLoading}
                    dataSource={topCreativeList}
                    scroll={{ y: scrollY, x: 1771 }}
                    expandIconAsCell={false}
                    expandIconColumnIndex={9}
                    childrenColumnName="campaign"
                    expandIcon={this.CustomExpandIcon}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                    components={tableComponent}
                >
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> key="rank" title="Rank" render={(_, record, index) => 'campaign_id_name' in record ? '' : index + 1} width={80} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative Type" dataIndex="creative_type_name" width={130} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative ID" dataIndex="creative_id" width={100} />

                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Creative" dataIndex="creative" width={108} render={(_, record) => !record.creative || record.creative == '--' ? '--' : <img src={record.creative} width="72" height="40" />} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Endcard ID" dataIndex="endcard_id" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Endcard" dataIndex="endcard" width={108} render={(_, record) => !record.endcard || record.endcard == '--' ? '--' : <img src={record.endcard} width="72" height="40" />} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="App ID" dataIndex="app_id" width={250} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Platform" dataIndex="platform" width={100} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Data Duration" dataIndex="data_duration" width={200} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList>
                        title="Campaign"
                        dataIndex="campaign_num"
                        width={100}
                        className={styles.expantCell}
                        render={(_, record) => <span className="text">
                            {'campaign_id_name' in record ? record['campaign_id_name'] : record.campaign_num}
                        </span>}
                    />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="Impression" dataIndex="impression" fixed="right" width={130} sorter={true} render={(_, record) => this.formatNumber(record.impression)} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="CTR" dataIndex="ctr" fixed="right" width={95} sorter={true} render={(_, record) => this.formatNumber(record.ctr) + '%'} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="CVR" dataIndex="cvr" fixed="right" width={95} sorter={true} render={(_, record) => this.formatNumber(record.cvr) + '%'} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList> title="IPM" dataIndex="ipm" fixed="right" width={95} sorter={true} render={(_, record) => this.formatNumber(record.ipm) + '%'} />
                    <Table.Column<ITopCreativeStore.ITopCreativeForList>
                        key="action"
                        title="Preview"
                        width={80}
                        fixed="right"
                        render={(_, record) => (
                            <span>
                                {'campaign_id_name' in record ||
                                    (<a key='form' href="javascript:;" onClick={() => this.modifyCreative(record)}>
                                        <Icon type="eye" />
                                    </a>)
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
