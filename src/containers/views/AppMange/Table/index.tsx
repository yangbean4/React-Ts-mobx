import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getAppManageLoading?: boolean
    appManageList?: IAppManageStore.IAppMange[],
    appManage?: IAppManageStore.IAppMange
    setAppManage?: (appManage: IAppManageStore.IAppMange) => void
    getAppManageList?: () => Promise<any>
    deleteEndcard?: (id: number) => Promise<any>
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
        const { routerStore, appManageStore } = store
        const {
            getAppManageLoading,
            appManageList,
            appManage,
            getAppManageList,
            handleTableChange,
            page,
            pageSize,
            total,
            setAppManage
        } = appManageStore
        return { routerStore, setAppManage,appManage, getAppManageLoading, getAppManageList, appManageList, handleTableChange, page, pageSize, total }
    }
)
@observer
class AppsManageTable extends ComponentExt<IProps> {
    @action
    modifyEndcard = (appManage: IAppManageStore.IAppMange) => {
        this.props.routerStore.push({
            pathname: `/offer/edit/${appManage.app_key}`,
        })
    }

    addEndcard = (record) => {
        this.props.routerStore.push('/offer/add')
    }

    componentDidMount() {
        this.props.getAppManageList()
    }

    render() {
        const {
            scrollY,
            getAppManageLoading,
            appManageList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<IAppManageStore.IAppMange>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey='app_key'
                locale={{ emptyText: 'No Data' }}
                loading={getAppManageLoading}
                dataSource={appManageList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<IAppManageStore.IAppMange> key="app_key" title="Appkey" dataIndex="app_key" width={200} />
                <Table.Column<IAppManageStore.IAppMange> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                <Table.Column<IAppManageStore.IAppMange> key="platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<IAppManageStore.IAppMange>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {
                                // this.$checkAuth('Apps-Virtual Endcard-Add', [
                                (<a key='form' href="javascript:;" onClick={() => this.modifyEndcard(record)}>
                                    <Icon type="form" />
                                </a>)
                                // ])
                            }
                        </span>
                    )}
                />
            </Table>
        )
    }
}

export default AppsManageTable
