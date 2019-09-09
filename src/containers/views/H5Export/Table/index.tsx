import * as React from 'react'
import { Table, message } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { preclicks } from '../config'
import Icon from '@components/Icon'

interface IStoreProps {
  getListLoading?: boolean
  list?: IWhiteBlackListStore.IitemForList[]
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
    const { routerStore, h5ExportStore } = store
    const {
      getListLoading,
      list,
      getList,
      handleTableChange,
      page,
      pageSize,
      total
    } = h5ExportStore
    return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total }
  }
)
@observer
class WhiteBlackTable extends ComponentExt<IProps> {


  componentDidMount() {
    // 读取列表
    this.props.getList()
  }

  copyDone = () => {
    message.success('copy success')
  }

  render() {
    const {
      scrollY,
      getListLoading,
      list,
      handleTableChange,
      page,
      pageSize,
      total
    } = this.props
    return (
      <div>
        <Table<IWhiteBlackListStore.IitemForList>
          className="center-table"
          bordered
          rowKey="id"
          locale={{ emptyText: 'No Data' }}
          loading={getListLoading}
          dataSource={list}
          scroll={{ y: scrollY, x: 1760 }}
          pagination={{
            current: page,
            pageSize,
            total,
            ...PageConfig
          }}
          onChange={handleTableChange}
        >
          <Table.Column<IH5ExportStore.IitemForList> key="app_key" title="AppKey" dataIndex="app_key" width={100} />
          <Table.Column<IH5ExportStore.IitemForList> key="app_id" title="App ID" dataIndex="app_id" width={200} />
          <Table.Column<IH5ExportStore.IitemForList> key="campaign_id" title="Campaign ID" dataIndex="campaign_id" width={100} />
          <Table.Column<IH5ExportStore.IitemForList> key="campaign_name" title="Campaign Name" dataIndex="campaign_name" width={150} />
          <Table.Column<IH5ExportStore.IitemForList> key="offer_id" title="Offer ID" dataIndex="offer_id" width={80} />
          <Table.Column<IH5ExportStore.IitemForList> key="offer_status" title="Offer Status" dataIndex="offer_status" width={100} />
          <Table.Column<IH5ExportStore.IitemForList> key="subsite_id" title="Subsite ID" dataIndex="subsite_id" width={100} />
          <Table.Column<IH5ExportStore.IitemForList> key="pkg_name" title="Pkg Name" dataIndex="pkg_name" width={150} />
          <Table.Column<IH5ExportStore.IitemForList> key="token" title="token" dataIndex="token" width={300} />
          <Table.Column<IH5ExportStore.IitemForList> key="pid" title="PID" dataIndex="pid" width={300} />
          <Table.Column<IH5ExportStore.IitemForList>
            key="preclick"
            title="Preclick"
            dataIndex="preclick"
            width={80}
            render={(_, record) => (
              <span>
                {(preclicks.find(v => v.value === record.preclick) || { key: '--' }).key}
              </span>
            )}
          />

          <Table.Column<IH5ExportStore.IitemForList>
            key="action"
            title="Operate"
            width={100}
            fixed="right"
            render={(_, record) => (
              <CopyToClipboard text={record.link} onCopy={() => this.copyDone()}>
                <a key='form' href="javascript:;">
                  <Icon type="iconlianjie" />
                </a>
              </CopyToClipboard>
            )}
          />
        </Table>
      </div>
    )
  }
}

export default WhiteBlackTable
