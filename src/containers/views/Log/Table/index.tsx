import * as React from 'react'
import { Table } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'

import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    logsLoading?: boolean
    logsList?: ILogsStore.ILog[]
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
        const {
            logsLoading,
            logsList,
            handleTableChange,
            page,
            pageSize,
            total
        } = store.logsStore
        return { logsLoading, logsList, handleTableChange, page, pageSize, total }
    }
)
@observer
class Logs extends ComponentExt<IProps> {

    render() {
        const {
            scrollY,
            logsLoading,
            logsList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<ILogsStore.ILog>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey={row => JSON.stringify(row)}
                loading={logsLoading}
                dataSource={logsList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<ILogsStore.ILog> key="operator_name" title="Operator" dataIndex="operator_name" width={200} />
                <Table.Column<ILogsStore.ILog> key="action" title="Type" dataIndex="action" width={100} />
                <Table.Column<ILogsStore.ILog> key="object" title="Object" dataIndex="object" width={100} />
                <Table.Column<ILogsStore.ILog> key="msg" title="Operation" dataIndex="msg" width={100} />
                <Table.Column<ILogsStore.ILog> key="add_time" title="Time" dataIndex="add_time" width={100} />
            </Table>
        )
    }
}

export default Logs
