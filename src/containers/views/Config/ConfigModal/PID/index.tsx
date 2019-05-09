import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Button, Table, Icon, Divider, Modal } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import FormPid from './formPid'
import { value_typeOption } from './valueType'

interface pidItem {
  placement_id?: string
  pid_type?: string | number
}

interface TableProps {
  onDelete: (index: number) => void
  onEdit: (index: number) => void
  data: any[]
}

@observer
class PidTable extends React.Component<TableProps> {

  render() {
    const { data, onDelete, onEdit } = this.props;
    const useData = data.map(ele => {
      if (Array.isArray(ele)) {
        let targrt = {}
        ele.forEach(ele => {
          targrt = { ...targrt, ...ele }
        })
        return targrt
      } else {
        return ele
      }
    })
    return (
      <Table<pidItem>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey={(row) => row.placement_id + row.pid_type}
        dataSource={useData}
        scroll={{ y: scrollY }}
      >
        <Table.Column<pidItem>
          key="pid_type"
          title="PID Type"
          dataIndex="pid_type"
          width={200}
          render={(_) => (
            value_typeOption.find(item => item.value == _).key
          )}
        />
        <Table.Column<pidItem> key="placement_id" title="PID" dataIndex="placement_id" width={200} />

        <Table.Column<pidItem>
          key="action"
          title="Operate"
          width={120}
          render={(_, record, index) => (
            <span>
              <a href="javascript:;" onClick={() => onEdit(index)}>
                <Icon type="form" />
              </a>
              <Divider type="vertical" />

              <a href="javascript:;" onClick={() => onDelete(index)}>
                <MyIcon type='iconshanchu' />
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
  onCancel: (data?) => void
  onSubmit: (data) => Promise<any>
  editData: any[]
}


@observer
class PID extends ComponentExt<IProps> {
  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: any[]

  private handelIndex: number

  private GJB: any[]

  private confirmModal


  @computed
  get editData() {
    return JSON.parse(JSON.stringify(this.props.editData || []))
  }

  @computed
  get useData() {
    return this.thisDataList || this.editData
  }

  @action
  toggleIsTable = () => {
    this.isTable = !this.isTable
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  @action
  setThisDataList = (arr) => {
    this.thisDataList = arr
  }


  submit = () => {
    const { onSubmit } = this.props
    this.toggleLoading()
    this.confirmModal ? this.props.onCancel(this.useData) : onSubmit(this.useData)
    this.toggleLoading()
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  getValue = (key, data) => {
    return (data.find(ele => ele.key === key) || {}).value
  }


  pidFormSubmit = (data) => {
    const arr: pidItem[] = JSON.parse(JSON.stringify(this.useData))
    if (this.handelIndex !== undefined) {
      arr.splice(this.handelIndex, 1, data)
    } else {
      arr.push(data)
    }
    this.setThisDataList(arr)
    this.toggleIsTable()
  }

  editPid = (index?) => {
    this.handelIndex = index
    if (index === undefined) {
      this.GJB = [];
    } else {
      this.GJB = this.useData[index]
    }
    this.toggleIsTable()
  }
  deletePid = (index) => {
    const arr: pidItem[] = JSON.parse(JSON.stringify(this.useData))
    arr.splice(index, 1)
    this.setThisDataList(arr)
  }

  lastStep = () => {
    this.confirmModal = Modal.confirm({
      okText: 'Yes',
      cancelText: 'No',
      content: 'Save the Settings of this page?',
      onCancel: () => {
        this.props.onCancel()
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      },
      onOk: () => {
        this.submit()
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      }
    })
  }

  render() {
    // const { form, editData } = this.props
    return (
      <div className='PID'>
        {
          this.isTable ? <div className="tableBox">
            <Button type="primary" onClick={() => this.editPid()}>+ Add</Button>

            <PidTable data={this.useData} onEdit={this.editPid} onDelete={this.deletePid} />
            <Button type="primary" className='submitBtn' onClick={this.submit}>Submit</Button>
            <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button>
          </div> : <div className="formBox">
              <FormPid
                data={this.GJB}
                onCancel={this.toggleIsTable}
                onSubmit={this.pidFormSubmit} />
            </div>
        }

      </div>
    )
  }
}

export default PID
