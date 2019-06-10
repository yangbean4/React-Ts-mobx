import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import FormAdd from './FormAdd'
import * as style from './index.scss'

interface TableProps {
  onEdit: (index: number) => void
  data: any[]
}


@observer
class VcTable extends ComponentExt<TableProps> {

  render() {
    const { data, onEdit } = this.props;

    return (
      <Table<IAppGroupStore.PlacementForList>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey='id'
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<IAppGroupStore.PlacementForList>
          key="pid_type_name"
          title="PID Type"
          dataIndex="pid_type_name"
          width={200}
        />
        <Table.Column<IAppGroupStore.PlacementForList>
          key="placement_name"
          title="Placement Name"
          dataIndex="placement_name"
          // render={(_) => (
          //   `${_}=1$`
          // )}
          width={200} />
        <Table.Column<IAppGroupStore.PlacementForList> key="placement_id" title="PID" dataIndex="placement_id" width={200} />
        <Table.Column<IAppGroupStore.PlacementForList>
          key="status"
          title="Status"
          dataIndex="status"
          // render={(_) => (
          //   statusOption.find(item => item.value === _).key
          // )}
          width={200} />

        <Table.Column<IAppGroupStore.PlacementForList>
          key="action"
          title="Operate"
          width={120}
          render={(_, record, index) => (
            <span>
              <a href="javascript:;" onClick={() => onEdit(index)}>
                <Icon type="form" />
              </a>
            </span>
          )}
        />
      </Table>
    )
  }
}

// --------------------------------------------------------------


interface IProps {
  Id?: string | number
  onCancel?: () => void
  isAdd?: boolean
  onSubmit?: () => void
}

@observer
class PID extends ComponentExt<IProps> {

  @observable
  private targetPlacement: IAppGroupStore.PlacementForList = {}

  @observable
  private GJB: IAppGroupStore.PlacementForList

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: IAppGroupStore.PlacementForList[]

  @action
  toggleIsTable = () => {
    this.isTable = !this.isTable
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  initDetail = async () => {
    if (this.props.isAdd) {
      this.editPid()
    } else if (this.props.Id !== undefined) {
      this.getPlacementList()
    }

  }

  @action
  getPlacementList = async () => {
    const res = await this.api.appGroup.placementList({ id: this.props.Id })
    runInAction('SETLIST', () => {
      this.thisDataList = res.data
    })
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  onOK = (id: number) => {
    this.getPlacementList()
    this.toggleIsTable()
  }

  editPid = (index?) => {
    const data = index === undefined ? {} : this.thisDataList[index]
    runInAction('set_GJB', () => {
      this.GJB = data
    })
    this.toggleIsTable()
  }


  componentWillMount() {
    this.initDetail()
  }

  render() {
    // const { form, editData } = this.props
    return (
      <div className='PID'>
        {
          this.isTable ? <div className="tableBox">
            <Button type="primary" className={style.addbtn} onClick={() => this.editPid()}>+ Add</Button>
            <VcTable data={this.thisDataList} onEdit={this.editPid} />
            <div className={style.btnGroup}>
              {/* <Button type="primary" className={style.submitBtn} onClick={this.submit}>Submit</Button> */}
              {/* <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button> */}
            </div>
          </div> : <div className="formBox">
              <FormAdd
                Id={this.props.Id}
                onCancel={this.onCancel}
                onOk={this.onOK}
                placementID={this.GJB.id} />
            </div>
        }
      </div>
    )
  }
}

export default PID
