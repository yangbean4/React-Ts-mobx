import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'


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
    modifyComment = (campaign: ICampaignStore.ICampainginForList, type?) => {
        this.props.setCampaingn(campaign)
        const {
            app_id,
            platform,
            app_key
        } = campaign
        localStorage.setItem('TargetCampaign', JSON.stringify({
            app_id,
            platform,
            app_key
        }))
        this.props.routerStore.push({
            pathname: '/campaigns/edit',
            state: {
                type
            }
        })
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
                <Table<ICampaignStore.ICampainginForList>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="app_key"
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
                    <Table.Column<ICampaignStore.ICampainginForList> key="app_key" title="Appkey" dataIndex="app_key" width={80} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
                    <Table.Column<ICampaignStore.ICampainginForList> key="platform" title="Platform" dataIndex="platform" width={100} />
                    <Table.Column<ICampaignStore.ICampainginForList>
                        key="action"
                        title="Operate"
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
