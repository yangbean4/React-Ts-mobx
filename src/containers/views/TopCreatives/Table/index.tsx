import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getTopCreativeLoading?: boolean
    creativeList?: ICreativeStore.ICreativeForList[]
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
            creativeList,
            getTopCreative,
            handleTableChange,
            page,
            pageSize,
            total,
            setCreative
        } = topCreativeStore
        return { routerStore, setCreative, getTopCreativeLoading, creativeList, getTopCreative, handleTableChange, page, pageSize, total }
    }
)
@observer
class TopCreativesTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false


    @action
    hideCreativeModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyCreative = (creative: ICreativeStore.ICreativeForList, type?) => {
        const {
            app_id,
            platform
        } = creative
        localStorage.setItem('TargetCreative', JSON.stringify(
            {
                app_id,
                platform
            }
        ))
        this.props.routerStore.push({
            pathname: `/creative/edit/${creative.app_key}`,
            state: {
                type
            }
        })
    }

    addCreative = (record) => {
        this.props.routerStore.push('/creative/add')
    }

    componentDidMount() {
        this.props.getTopCreative()
    }

    render() {
        const {
            scrollY,
            getTopCreativeLoading,
            creativeList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<ICreativeStore.ICreativeForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey='app_key'
                locale={{ emptyText: 'No Data' }}
                loading={getTopCreativeLoading}
                dataSource={creativeList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<ICreativeStore.ICreativeForList> key="app_key" title="Appkey" dataIndex="app_key" width={200} />
                <Table.Column<ICreativeStore.ICreativeForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                <Table.Column<ICreativeStore.ICreativeForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<ICreativeStore.ICreativeForList>
                    key="action"
                    title="Operate"
                    width={120}
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
        )
    }
}

export default TopCreativesTable
