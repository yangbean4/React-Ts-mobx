import * as React from 'react'
import { Table } from 'antd'
import Icon from '@components/Icon'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../web.config'

interface IStoreProps {
  getOfferQueryLoading?: boolean
  getOfferQuerys?: () => Promise<any>
  offerList?: IOfferQueryStore.IQuery[]
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
    const { routerStore, offerQueryStore } = store
    const {
      getOfferQueryLoading,
      getOfferQuerys,
      offerList,
      handleTableChange,
      page,
      pageSize,
      total,
    } = offerQueryStore
    return { routerStore, getOfferQueryLoading, offerList, getOfferQuerys, handleTableChange, page, pageSize, total }
  }
)
@observer
class QueryTable extends ComponentExt<IProps> {
  @action
  downLoadExel = (operator: IRevenueStore.IRevenue) => {

  }

  routerGo = (router) => {
    const uri = `${window.location.origin}${window.location.pathname}#${router}`
    console.log(uri)
    window.open(uri)
  }

  componentDidMount() {
    this.props.getOfferQuerys()
  }

  render() {
    const {
      getOfferQueryLoading,
      offerList,
      handleTableChange,
      page,
      pageSize,
      total,
      scrollY
    } = this.props
    return (
      <Table<IOfferQueryStore.IQuery>
        className="center-table"
        style={{ width: '100%', wordBreak: 'break-all' }}
        bordered
        rowKey="id"
        locale={{ emptyText: 'No Data' }}
        loading={getOfferQueryLoading}
        dataSource={offerList}
        scroll={{ y: scrollY, x: 2200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          ...PageConfig
        }}
        onChange={handleTableChange}
      >
        <Table.Column<IOfferQueryStore.IQuery> key="id" title="Offer ID" dataIndex="id" width={100} />
        <Table.Column<IOfferQueryStore.IQuery> key="app_key" title="App Key" dataIndex="app_key" width={100}
          render={(_, record) => (
            <span>
              {
                this.$checkAuth('Offers-Apps Manage-Edit') ?
                  (<a key='form' href="javascript:;" onClick={() => { this.routerGo(`/offer/edit/${record.app_key}`) }}>
                    {_}
                  </a>) : _
              }
            </span>
          )}
        />
        <Table.Column<IOfferQueryStore.IQuery> key="app_id" title="App ID" dataIndex="app_id" width={300} />
        <Table.Column<IOfferQueryStore.IQuery> key="platform" title="Platform" dataIndex="platform" width={100} />
        <Table.Column<IOfferQueryStore.IQuery> key="sen_account" title="Sen Account" dataIndex="sen_account" width={150} />
        <Table.Column<IOfferQueryStore.IQuery> key="campaign_id" title="Campaign ID" dataIndex="campaign_id" width={150}
          render={(_, record) => (
            <span>
              {
                this.$checkAuth('Offers-Campaigns-Campaigns-Edit') ?
                  (<a key='form' href="javascript:;" onClick={() => { this.routerGo(`/campaigns/edit/${_}`) }}>
                    {_}
                  </a>) : _
              }
            </span>
          )}
        />
        <Table.Column<IOfferQueryStore.IQuery> key="campaign_name" title="Campaign Name" dataIndex="campaign_name" width={250} />
        <Table.Column<IOfferQueryStore.IQuery> key="geo" title="GEO" dataIndex="geo" width={100} />
        <Table.Column<IOfferQueryStore.IQuery> key="bid" title="Bid($)" dataIndex="bid" width={80} />
        <Table.Column<IOfferQueryStore.IQuery> key="ad_type" title="Ad Type" dataIndex="ad_type" width={100} />
        <Table.Column<IOfferQueryStore.IQuery> key="campaign_status" title="Campaign Status" dataIndex="campaign_status" width={150} />
        <Table.Column<IOfferQueryStore.IQuery> key="creative_id" title="Creative ID" dataIndex="creative_id" width={100}
          render={(_, record) => (
            <span>
              {
                this.$checkAuth('Offers-Creatives-Creatives-Edit') ?
                  (<a key='form' href="javascript:;" onClick={() => {
                    this.routerGo(`/creative/edit/${record.app_key}?editId=${_}`,
                    )
                  }}>
                    {_}
                  </a>) : _
              }
            </span>
          )}
        />
        <Table.Column<IOfferQueryStore.IQuery> key="creative_type" title="Creative Type" dataIndex="creative_type" width={120} />
        <Table.Column<IOfferQueryStore.IQuery> key="endcard_id" title="Endcard ID" dataIndex="endcard_id" width={100}
          render={(_, record) => (
            <span>
              {
                this.$checkAuth('Offers-Endcards-Endcard-Edit') ?
                  (<a key='form' href="javascript:;" onClick={() => {
                    this.routerGo(`/endcard/edit/${record.app_key}?editId=${_}`,
                    )
                  }}>
                    {_}
                  </a>) : _
              }
            </span>
          )}
        />
        <Table.Column<IOfferQueryStore.IQuery> key="update_time" title="Update Time" dataIndex="update_time" width={170} />
        <Table.Column<IOfferQueryStore.IQuery> key="offer_status" fixed="right" title="Offer Status" dataIndex="offer_status" width={130} />
      </Table>
    )
  }
}

export default QueryTable
