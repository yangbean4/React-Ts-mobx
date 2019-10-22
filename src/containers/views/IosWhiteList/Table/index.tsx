import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getListLoading?: boolean
    list?: IIosWhiteListStore.IitemForList[]
    getList?: () => Promise<any>
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
        const { routerStore, iosWhiteListStore } = store
        const {
            getListLoading,
            list,
            getList,
            handleTableChange,
            page,
            pageSize,
            total,
        } = iosWhiteListStore

        return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total }
    }
)
@observer
class CreativeTable extends ComponentExt<IProps> {
    @action
    modifyItem = (item: IIosWhiteListStore.IitemForList) => {
        this.props.routerStore.push({
            pathname: `/iosWhitelist/edit/${item.bundle_id}`,
        })
    }

    componentDidMount() {
        this.props.getList()
    }

    render() {
        const { scrollY, getListLoading, list, handleTableChange, page, pageSize, total } = this.props
        return (
            <Table<IIosWhiteListStore.IitemForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey="app_key"
                locale={{ emptyText: 'No Data' }}
                loading={getListLoading}
                dataSource={list}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<IIosWhiteListStore.IitemForList>
                    key="bundle_id"
                    title="Bundle ID"
                    dataIndex="bundle_id"
                    width={200}
                />
                <Table.Column<IIosWhiteListStore.IitemForList>
                    key="platform"
                    title="Platform"
                    dataIndex="platform"
                    width={200}
                />
                <Table.Column<IIosWhiteListStore.IitemForList>
                    key="version"
                    title="Version Number"
                    dataIndex="version_number"
                    width={100}
                    render={(_, record) => _ ?
                        this.$checkAuth('Config Manage-IOS Whitelist-Edit', [
                            <a key="form" href="javascript:;" onClick={() => this.modifyItem(record)}>{_}</a>
                        ])
                        : _}
                />
                <Table.Column<IIosWhiteListStore.IitemForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {this.$checkAuth('Config Manage-IOS Whitelist-Edit', [
                                <a key="form" href="javascript:;" onClick={() => this.modifyItem(record)}>
                                    <Icon type="form" />
                                </a>
                            ])}
                        </span>
                    )}
                />
            </Table>
        )
    }
}

export default CreativeTable
