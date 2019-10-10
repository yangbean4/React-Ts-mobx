import * as React from 'react'
import { Table, Icon, Tooltip, Popover, Divider } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import * as styles from '../index.scss'
import { action, observable, runInAction } from 'mobx';
import TableModal from './tableModal'
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
    const { routerStore, whiteBlackListStore } = store
    const {
      getListLoading,
      list,
      getList,
      handleTableChange,
      page,
      pageSize,
      total
    } = whiteBlackListStore
    return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total }
  }
)
@observer
class WhiteBlackTable extends ComponentExt<IProps> {

  @observable
  private modalVisible: boolean = false

  @observable
  private tableModalData: any[] = [];
  @observable
  private pkgName: string

  componentDidMount() {
    // 读取列表
    this.props.getList()
  }


  @action
  hideTableModal = () => {
    this.modalVisible = !this.modalVisible;
  }

  @action
  changeTableModal = (data) => {
    this.tableModalData = data;
  }

  @action
  showModal = (data) => {
    console.dir(data);
    runInAction('SET_', () => {
      this.tableModalData = data.placement_campaign;
      // let arr = [{
      //   campaign_id_name: "100409-video_000258",
      //   placement_name_id: "com.zepra.tbrick_appwall-1662684189370000_1769833153873063",
      //   type: "Whitelist"
      // },]
      // this.tableModalData = arr;
      this.pkgName = data.pkg_name;
    })

    setImmediate(() => {
      this.hideTableModal()
    })
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
      <React.Fragment>
        <div>
          <TableModal visible={this.modalVisible} onCancel={this.hideTableModal} tableData={this.tableModalData} pkgname={this.pkgName} />
          <Table<IWhiteBlackListStore.IitemForList>
            className="center-table"
            bordered
            rowKey="id"
            locale={{ emptyText: 'No Data' }}
            loading={getListLoading}
            dataSource={list}
            scroll={{ y: scrollY }}
            pagination={{
              current: page,
              pageSize,
              total,
              ...PageConfig
            }}
            onChange={handleTableChange}
          >
            <Table.Column<IWhiteBlackListStore.IitemForList>
              key="pkg_name"
              title="Pkg Name"
              dataIndex="pkg_name"
              width="25%"
              render={(_, record) => record.pkg_name ? record.pkg_name : '--'}
            />
            <Table.Column<IWhiteBlackListStore.IitemForList>
              key="category"
              title="Category  Whitelist"
              dataIndex="category"
              width="20%"
              render={(_, record) =>
                record.category ?
                  record.category.length > 70 ? (
                    <Popover placement="top" content={(
                      <div style={{ maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-all' }}>{record.category}</div>
                    )}>
                      {record.category.substring(0, 70)}...
                  </Popover>
                  ) : record.category
                  : '--'
              }
            />
            <Table.Column<IWhiteBlackListStore.IitemForList>
              key="app_id"
              title="App ID Blacklist"
              dataIndex="app_id"
              width="20%"
              render={(_, record) => {
                if (!record.app_id) return '--';

                let appids = record.app_id.split(',')
                return appids.length > 1 ? (
                  <Popover placement="left" content={(
                    <div className={styles.popoverContent}>
                      {appids.map((c) => (
                        <div>{c}</div>
                      ))}
                    </div>
                  )}>
                    {appids[0]},...
                </Popover>
                ) : appids[0]
              }}
            />
            <Table.Column<IWhiteBlackListStore.IitemForList>
              key="placement_campaign"
              title="Placement-Campaign"
              dataIndex="placement_campaign"
              width="20%"
              render={(_, record) => (
                <button className={styles.linkBtn} onClick={() => this.showModal(record)}>
                  <Icon type="eye" />
                </button>
              )}
            />
            <Table.Column<IWhiteBlackListStore.IitemForList>
              key="action"
              title="Operate"
              width="8%"
              render={(_, record) => (
                <button className={styles.linkBtn} key='edit' onClick={() => this.props.routerStore.push(`whiteBlackList/edit/${record.id}`)}>
                  <Icon type="form" />
                </button>
              )}
            />
          </Table>
        </div>
      </React.Fragment>
    )
  }
}

export default WhiteBlackTable
