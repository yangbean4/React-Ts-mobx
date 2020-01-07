import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getListLoading?: boolean
    list?: ILoadVideoStore.IitemForList[]
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
        const { routerStore, loadVideoStore } = store
        const {
            getListLoading,
            list,
            getList,
            handleTableChange,
            page,
            pageSize,
            total,
        } = loadVideoStore

        return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total }
    }
)
@observer
class CreativeTable extends ComponentExt<IProps> {
    @action
    modifyItem = (item: ILoadVideoStore.IitemForList) => {
        window.sessionStorage.setItem('edit_loadvideo_item', JSON.stringify(item));

        this.props.routerStore.push({
            pathname: `/loadVideo/edit`,
        })
    }

    componentDidMount() {
        this.props.getList()
    }

    render() {
        const { scrollY, getListLoading, list, handleTableChange, page, pageSize, total } = this.props
        return (
            <Table<ILoadVideoStore.IitemForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey="pkg_name"
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
                <Table.Column<ILoadVideoStore.IitemForList>
                    title="Pkg Name"
                    dataIndex="pkg_name"
                    width={200}
                />
                <Table.Column<ILoadVideoStore.IitemForList>
                    title="Bundle ID"
                    dataIndex="bundle_id"
                    width={200}
                />
                <Table.Column<ILoadVideoStore.IitemForList>
                    key="platform"
                    title="Platform"
                    dataIndex="platform"
                    width={200}
                />
                <Table.Column<ILoadVideoStore.IitemForList>
                    title="Template Number"
                    dataIndex="num"
                    width={100}
                    render={(_, record) => _ ?
                        this.$checkAuth('Config Manage-Template Manage', [
                            <a key="form" href="javascript:;" onClick={() => this.modifyItem(record)}>{_}</a>
                        ]) || _
                        : _}
                />
                <Table.Column<ILoadVideoStore.IitemForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {this.$checkAuth('Config Manage-Template Manage', [
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
