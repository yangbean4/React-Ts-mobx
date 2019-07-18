import * as React from 'react'
import { Table } from 'antd'
import Icon from '@components/Icon'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../web.config'

interface IStoreProps {
    getRevenueLoading?: boolean
    getRevenues?: () => Promise<any>
    RevenueList?: IRevenueStore.IRevenue[]
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
        const { routerStore, revenueStore } = store
        const {
            getRevenueLoading,
            RevenueList,
            getRevenues,
            handleTableChange,
            page,
            pageSize,
            total,
        } = revenueStore
        return { routerStore, getRevenueLoading, RevenueList, getRevenues, handleTableChange, page, pageSize, total }
    }
)
@observer
class RevenueTable extends ComponentExt<IProps> {
    @action
    downLoadExel = (operator: IRevenueStore.IRevenue) => {

    }
    componentDidMount() {
        this.props.getRevenues()
    }
    render() {
        const {
            scrollY,
            getRevenueLoading,
            RevenueList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<IRevenueStore.IRevenue>
                className="center-table"
                style={{ width: '100%', wordBreak: 'break-all' }}
                bordered
                rowKey='id'
                locale={{ emptyText: 'No Data' }}
                loading={getRevenueLoading}
                dataSource={RevenueList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<IRevenueStore.IRevenue> key="file_name" title="File Name" dataIndex="file_name" width={200} />
                <Table.Column<IRevenueStore.IRevenue> key="operator" title="Operator" dataIndex="operator" width={150} />
                <Table.Column<IRevenueStore.IRevenue> key="status" title="Status" dataIndex="status"
                    render={(_) => (
                        statusOption.find(item => item.value == _) == undefined ? {} : statusOption.find(item => item.value == _).key
                    )}
                    width={150} />
                <Table.Column<IRevenueStore.IRevenue> key="add_time" title="Add Time" dataIndex="add_time" width={150} />
                <Table.Column<IRevenueStore.IRevenue>
                    key="action"
                    title="Operate"
                    width={100}
                    render={(_, record) => (
                        <span>
                            {
                                this.$checkAuth('Revenue Import-Revenue Import', [
                                    (<a key='form' href={record.url} download onClick={() => this.downLoadExel(record)}>
                                        <Icon type="icondaoru" />
                                    </a>)
                                ])
                            }
                        </span>
                    )}
                />
            </Table>
        )
    }
}

export default RevenueTable
