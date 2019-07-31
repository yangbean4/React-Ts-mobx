import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getLeadContentLoading?: boolean
    leadContentList?: ILeadContentStore.ILeadContentForList[]
    setLeadContent?: (leadContent: ILeadContentStore.ILeadContent) => void
    getLeadContent?: () => Promise<any>
    deleteLeadContent?: (id: number) => Promise<any>
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
        const { routerStore, leadContentStore } = store
        const {
            getLeadContentLoading,
            leadContentList,
            getLeadContent,
            handleTableChange,
            page,
            pageSize,
            total,
            setLeadContent
        } = leadContentStore
        return { routerStore, setLeadContent, getLeadContentLoading, leadContentList, getLeadContent, handleTableChange, page, pageSize, total }
    }
)
@observer
class LeadContentTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false


    @action
    hideLeadContentModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyLeadContent = (leadContent: ILeadContentStore.ILeadContentForList, type?) => {
        const {
            app_id,
            platform
        } = leadContent
        localStorage.setItem('TargetLeadContent', JSON.stringify(
            {
                app_id,
                platform
            }
        ))
        this.props.routerStore.push({
            pathname: `/leadContent/edit/${leadContent.app_key}`,
            state: {
                type
            }
        })
    }

    addLeadContent = (record) => {
        this.props.routerStore.push('/leadContent/add')
    }

    componentDidMount() {
        this.props.getLeadContent()
    }

    render() {
        const {
            scrollY,
            getLeadContentLoading,
            leadContentList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<ILeadContentStore.ILeadContentForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey='app_key'
                locale={{ emptyText: 'No Data' }}
                loading={getLeadContentLoading}
                dataSource={leadContentList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<ILeadContentStore.ILeadContentForList> key="app_key" title="Appkey" dataIndex="app_key" width={200} />
                <Table.Column<ILeadContentStore.ILeadContentForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                <Table.Column<ILeadContentStore.ILeadContentForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<ILeadContentStore.ILeadContentForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {
                                this.$checkAuth('Offers-Creatives-Lead Content-Edit', [
                                    (<a key='form' href="javascript:;" onClick={() => this.modifyLeadContent(record)}>
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

export default LeadContentTable
