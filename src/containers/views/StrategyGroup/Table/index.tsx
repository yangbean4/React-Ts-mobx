import * as React from 'react'
import { Table } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { action, observable } from 'mobx';
interface IStoreProps {
  getListLoading?: boolean
  list?: IStrategyGroupStore.IitemForList[]
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
    const { routerStore, StrategyGroupStore } = store
    const {
      getListLoading,
      list,
      getList,
      handleTableChange,
      page,
      pageSize,
      total
    } = StrategyGroupStore
    return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total }
  }
)
@observer
class WhiteBlackTable extends ComponentExt<IProps> {

  @observable
  private modalVisible: boolean = false

  componentDidMount() {
    this.props.getList()
  }


  @action
  hideTableModal = () => {
    this.modalVisible = !this.modalVisible;
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
          <Table<IStrategyGroupStore.IitemForList>
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
            <Table.Column<IStrategyGroupStore.IitemForList>
              dataIndex="id"
              title="ID"
              width="25%"
            />
            <Table.Column<IStrategyGroupStore.IitemForList>
              dataIndex="strategy_name"
              title="Strategy Name"
              width="20%"
            />
            <Table.Column<IStrategyGroupStore.IitemForList>
              dataIndex="add_time"
              title="Add Time"
              width="20%"
            />

          </Table>
        </div>
      </React.Fragment>
    )
  }
}

export default WhiteBlackTable
