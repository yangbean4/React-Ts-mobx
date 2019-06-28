import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getEndcardLoading?: boolean
    endcardList?: IEndcardStore.IEndcardForList[]
    setEndcard?: (endcard: IEndcardStore.IEndcard) => void
    getEndcard?: () => Promise<any>
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
        const { routerStore, endcardStore } = store
        const {
            getEndcardLoading,
            endcardList,
            getEndcard,
            handleTableChange,
            page,
            pageSize,
            total,
            setEndcard
        } = endcardStore
        return { routerStore, setEndcard, getEndcardLoading, endcardList, getEndcard, handleTableChange, page, pageSize, total }
    }
)
@observer
class EndcardTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false


    @action
    hideEndcardModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyEndcard = (endcard: IEndcardStore.IEndcardForList, type?) => {
        const {
            app_id,
            platform
        } = endcard
        localStorage.setItem('TargetEndcard', JSON.stringify(
            {
                app_id,
                platform
            }
        ))
        this.props.routerStore.push({
            pathname: `/endcard/edit/${endcard.app_key}`,
            state: {
                type
            }
        })
    }

    addEndcard = (record) => {
        this.props.routerStore.push('/endcard/add')
    }

    componentDidMount() {
        this.props.getEndcard()
    }

    render() {
        const {
            scrollY,
            getEndcardLoading,
            endcardList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<IEndcardStore.IEndcardForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey='app_key'
                locale={{ emptyText: 'No Data' }}
                loading={getEndcardLoading}
                dataSource={endcardList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<IEndcardStore.IEndcardForList> key="app_key" title="Appkey" dataIndex="app_key" width={200} />
                <Table.Column<IEndcardStore.IEndcardForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                <Table.Column<IEndcardStore.IEndcardForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<IEndcardStore.IEndcardForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {
                                this.$checkAuth('Offers-Endcards-Endcard-Edit', [
                                    (<a key='form' href="javascript:;" onClick={() => this.modifyEndcard(record)}>
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

export default EndcardTable
