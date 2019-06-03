import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import { statusOption } from '../web.config'

interface IStoreProps {
    getAppGroupLoading?: boolean
    appGroupList?: IAppGroupStore.IAppGroupForList[]
    setAppGroup?: (appGroup: IAppGroupStore.IAppGroup) => void
    getAppGroup?: () => Promise<any>
    deleteAppGroup?: (id: number) => Promise<any>
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
        const { routerStore, appGroupStore } = store
        const {
            getAppGroupLoading,
            appGroupList,
            getAppGroup,
            handleTableChange,
            page,
            pageSize,
            total,
            setAppGroup
        } = appGroupStore
        return { routerStore, setAppGroup, getAppGroupLoading, appGroupList, getAppGroup, handleTableChange, page, pageSize, total }
    }
)
@observer
class AppGroupTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false


    @action
    hideAppGroupModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyAppGroup = (appGroup: IAppGroupStore.IAppGroupForList) => {
        this.props.setAppGroup(appGroup)
        localStorage.setItem('TargetAppGroup', JSON.stringify(appGroup))
        this.props.routerStore.push(`/apps/edit/${appGroup.id}`)
    }

    addAppGroup = () => {
        this.props.routerStore.push('/apps/add')
    }

    componentDidMount() {
        this.props.getAppGroup()
    }



    render() {
        const {
            scrollY,
            getAppGroupLoading,
            appGroupList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<IAppGroupStore.IAppGroupForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey="id"
                locale={{ emptyText: 'No Data' }}
                loading={getAppGroupLoading}
                dataSource={appGroupList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<IAppGroupStore.IAppGroupForList> key="app_name" title="App Name" dataIndex="app_name" width={200} />
                <Table.Column<IAppGroupStore.IAppGroupForList> key="pkg_name" title="Pkg Name" dataIndex="pkg_name" width={200} />
                <Table.Column<IAppGroupStore.IAppGroupForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<IAppGroupStore.IAppGroupForList> key="sdk_token" title="SDK Token" dataIndex="sdk_token" width={200} />
                <Table.Column<IAccountStore.IAccount>
                    key="status"
                    title="Status"
                    dataIndex="status"
                    width={100}
                    render={(_) => (
                        statusOption.find(item => item.value === _).key
                    )}
                />
                <Table.Column<IAppGroupStore.IAppGroupForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {
                                // this.$checkAuth('Apps-Virtual AppGroup-Add', [
                                (<a key='form' href="javascript:;" onClick={() => this.modifyAppGroup(record)}>
                                    <Icon type="form" />
                                </a>)
                                // ])
                            }
                            {
                                // this.$checkAuth('Apps-Virtual AppGroup-Edit&Apps-Virtual AppGroup-Add', (
                                <Divider key='Divider' type="vertical" />
                                // ))
                            }
                            {
                                // this.$checkAuth('Authorization-AppGroup Manage-Delete', (
                                <a href="javascript:;" onClick={() => this.addAppGroup()}>
                                    <Icon type='plus' />
                                </a>
                                // ))
                            }
                        </span>
                    )}
                />
            </Table>
        )
    }
}

export default AppGroupTable
