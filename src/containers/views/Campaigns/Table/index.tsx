import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'


interface IStoreProps {
    getCampaignsLoading?: boolean
    campaigns?: ICampaignStore.ICampaignGroup[]
    setCampaingn?: (comment: ICampaignStore.ICampaignGroup) => void
    getCampaigns?: () => Promise<any>
    setCampaignType?: (string) => void
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
        const { routerStore, campaignStore } = store
        const {
            getCampaignsLoading,
            setCampaingn,
            getCampaigns,
            campaigns,
            handleTableChange,
            page,
            pageSize,
            setCampaignType,
            total
        } = campaignStore
        return { routerStore, getCampaignsLoading, setCampaingn, getCampaigns, campaigns, handleTableChange, page, pageSize, setCampaignType, total }
    }
)
@observer
class CampaignsTable extends ComponentExt<IProps> {

    @observable
    private commentType: string = ''

    @action
    modifyComment = (campaign: ICampaignStore.ICampaignGroup) => {
        const { app_key } = campaign
        localStorage.setItem('offer_app_key', JSON.stringify({
            app_key 
        }))
        this.props.setCampaingn(campaign)
        this.props.routerStore.replace(`/campaigns/edit`)
    }
    // 去请求数据
    componentDidMount() {
        const companyType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        if (companyType !== this.commentType) {
            runInAction('SET_TYPE', () => {
                this.commentType = companyType
            })
        }
        this.props.setCampaignType(companyType)
    }

    render() {
        const {
            scrollY,
            getCampaignsLoading,
            campaigns,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<ICampaignStore.ICampaignGroup>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="record_id"
                    loading={getCampaignsLoading}
                    dataSource={campaigns}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ICampaignStore.ICampaignGroup> key="app_key" title="Appkey" dataIndex="app_key" width={80} />
                    <Table.Column<ICampaignStore.ICampaignGroup> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                    <Table.Column<ICampaignStore.ICampaignGroup> key="platform" title="Platform" dataIndex="platform" width={100} />
                    <Table.Column<ICampaignStore.ICampaignGroup>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Authorization-User Manage-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyComment(record)}>
                                            <Icon type="form" />
                                        </a>)
                                    ])
                                }
                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}

export default CampaignsTable
