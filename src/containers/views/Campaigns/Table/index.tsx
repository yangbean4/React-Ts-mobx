import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../web.config'

interface IStoreProps {
    getCampaignsLoading?: boolean
    campaigns?: ICampaignStore.ICampainginForList[]
    setCampaingn?: (campaign: ICampaignStore.ICampainginForList) => void
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
            getCampaigns,
            campaigns,
            handleTableChange,
            page,
            pageSize,
            setCampaingn,
            setCampaignType,
            total
        } = campaignStore
        return { routerStore, setCampaingn, getCampaignsLoading, getCampaigns, campaigns, handleTableChange, page, pageSize, setCampaignType, total }
    }
)
@observer
class CampaignsTable extends ComponentExt<IProps> {

    @observable
    private commentType: string = ''

    @action
    modifyComment = (campaign: ICampaignStore.ICampainginForList) => {
        this.props.setCampaingn(campaign)
        // const {
        //     app_id,
        //     platform,
        //     app_key
        // } = campaign
        // localStorage.setItem('TargetCampaign', JSON.stringify({
        //     app_id,
        //     platform,
        //     app_key
        // }))
        // this.props.routerStore.push({
        //     pathname: '/campaigns/edit',
        //     state: {
        //         type
        //     }
        // })
        this.props.routerStore.replace(`/campaigns/edit/${campaign.id}`)
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
                <Table<ICampaignStore.ICampainginForList>
                    className="center-table"
                    style={{ width: '100%', wordBreak: 'break-all' }}
                    bordered
                    rowKey="id"
                    loading={getCampaignsLoading}
                    dataSource={campaigns}
                    scroll={{ y: scrollY, x: '130%' }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ICampaignStore.ICampainginForList> key="app_key" title="Appkey" dataIndex="app_key" width={120} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="app_id" title="App ID" dataIndex="app_id" width={250} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="id" title="Campaign ID" dataIndex="id" width={150} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="campaign_name" title="Campaign Name" dataIndex="campaign_name" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="target_code" title="Target Code" dataIndex="target_code" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="ad_type" title="Ad Type" dataIndex="ad_type" width={100} />

                    <Table.Column<ICampaignStore.ICampainginForList> key="user_name" title="SEN Account" dataIndex="user_name" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="start_time" title="Start Time" dataIndex="start_time" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="end_time" title="End Time" dataIndex="end_time" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="status" title="Status" dataIndex="status"
                        render={(_) => (
                            statusOption.find(item => item.value === _) === undefined ? {} : statusOption.find(item => item.value === _).key
                        )}
                        width={110} />

                    <Table.Column<ICampaignStore.ICampainginForList>
                        key="action"
                        title="Operate"
                        fixed='right'
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Campaigns-Edit', [
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
