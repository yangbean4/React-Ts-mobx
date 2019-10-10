import * as React from 'react'
import { Table, Modal, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { pidTypes } from '../config'


const { confirm } = Modal;

interface IStoreProps {
  getListLoading?: boolean
  list?: ICreativeFrequencyStore.IitemForList[]
  getList?: () => Promise<any>
  handleTableChange?: (pagination: PaginationConfig) => void
  page?: number
  pageSize?: number
  total?: number
  routerStore?: RouterStore,
  deleteFrequency?: (id: number) => Promise<any>
  setItem?: (item: ICreativeFrequencyStore.IitemForList) => void
}

interface IProps extends IStoreProps {
  scrollY: number
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, creativeFrequencyStore } = store
    const {
      getListLoading,
      list,
      getList,
      handleTableChange,
      page,
      pageSize,
      total,
      deleteFrequency,
      setItem
    } = creativeFrequencyStore
    return { routerStore, getListLoading, list, getList, handleTableChange, page, pageSize, total, deleteFrequency, setItem }
  }
)
@observer
class CreativeFrequencyTable extends ComponentExt<IProps> {


  componentDidMount() {
    // 读取列表
    this.props.getList()
  }

  modify = (frequency: ICreativeFrequencyStore.IitemForList) => {
    this.props.setItem(frequency);
    this.props.routerStore.push('/creativeFrequency/edit/' + frequency.id);
  }

  delete = (frequency: ICreativeFrequencyStore.IitemForList) => {
    let id = frequency.id;
    let that = this;
    confirm({
      title: 'Confirm to delete it?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: () => {
        that.props.deleteFrequency(id)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
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
        <Table<ICreativeFrequencyStore.IitemForList>
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
          <Table.Column<ICreativeFrequencyStore.IitemForList> title="Pkg Name" dataIndex="pkg_name" width={200} />
          <Table.Column<ICreativeFrequencyStore.IitemForList> title="PID Type" dataIndex="pid_type" width={150} render={(_) => (pidTypes.find(v => v.value === _) || {}).key} />
          <Table.Column<ICreativeFrequencyStore.IitemForList> title="Creative" key="creative" width={220} render={(_, record) => record.creative_name ? `${record.creative_id}-${record.creative_name}` : 'All'} />
          <Table.Column<ICreativeFrequencyStore.IitemForList> title="Frequency" key="frequency" width={180} render={(_, record) => `${record.limit_time}time(s) / ${record.limit_num}day(s)`} />
          <Table.Column<ICreativeFrequencyStore.IitemForList> title="Update Time" dataIndex="update_time" width={200} />
          <Table.Column<ICreativeFrequencyStore.IitemForList>
            key="action"
            title="Operate"
            width={100}
            render={(_, record) => (
              <>
                <a key='modify' href="javascript:;" onClick={() => this.modify(record)}>
                  <Icon type="form" />
                </a>
                <a style={{ marginLeft: 10 }} key='delete' href="javascript:;" onClick={() => this.delete(record)}>
                  <Icon type="delete" />
                </a>
              </>
            )}
          />
        </Table>
      </div>
    )
  }
}

export default CreativeFrequencyTable
