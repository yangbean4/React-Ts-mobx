import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Button, Table, Icon, Divider, Modal } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import FormPid from './formPid'
import { value_typeOption } from './valueType'


const likeArray2obj = (res) => {
  let arr = {}
  Object.keys(res).forEach(ele => {
    arr = Object.assign(arr, res[ele])
  })
  return arr
}

const isLikeArray = (res: object) => {
  return res && Object.keys(res).every(key => !isNaN(Number(key)))
}

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
class PidTable extends ComponentExt<TableProps> {

  private confirmModal

  onDelete = (index) => [
    this.confirmModal = Modal.confirm({
      okText: 'Yes',
      cancelText: 'No',
      content: 'Sure to delete the PID config set?',
      onCancel: () => {
        this.confirmModal.destroy()
      },
      onOk: () => {
        this.props.onDelete(index)
        this.confirmModal.destroy()
      }
    })
  ]

  render() {
    const { data, onDelete, onEdit } = this.props;

    return (
      <Table<pidItem>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey={(row) => row.placement_id + row.pid_type}
        dataSource={data}
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

              <a href="javascript:;" onClick={() => this.onDelete(index)}>
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


interface IStoreProps {
  targetConfig?: IConfigStore.IConfigTarget
}
interface IProps extends IStoreProps {
  onCancel: (data?) => void
  onSubmit: (data) => Promise<any>
  editData: any[]
  configId?: string
  RefreshData?: () => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { configStore } = store
    const { targetConfig } = configStore
    return { targetConfig }
  }
)

@observer
class PID extends ComponentExt<IProps> {

  @observable
  private addConfigGroup = {}

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

  @computed
  get tableData() {
    return this.useData.map(ele => {

      if (Array.isArray(ele)) {
        ele = { ...ele }
      }
      if (isLikeArray(ele)) {
        return likeArray2obj(ele)
      } else {
        return ele
      }
    })
  }

  initDetail = async () => {
    const Detail = await this.api.config.pidFieldInfo({ platform: (this.props.targetConfig || {}).platform || 'android' })
    runInAction('Change_', () => {
      this.addConfigGroup = Detail.data
    })
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
    // this.confirmModal ? this.props.onCancel(this.useData) : onSubmit(this.useData)
    onSubmit(this.useData)
    this.toggleLoading()
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  getValue = (key, data) => {
    return (data.find(ele => ele.key === key) || {}).value
  }


  pidFormSubmit = async (data) => {
    if (!this.props.configId) {
      const arr: pidItem[] = JSON.parse(JSON.stringify(this.useData))
      if (this.handelIndex !== undefined) {
        arr.splice(this.handelIndex, 1, data)
      } else {
        arr.push(data)
      }
      this.setThisDataList(arr)
      this.toggleIsTable()

    } else {
      const res = await this.api.config.editPID({
        config_deploy_id: this.props.configId,
        type: likeArray2obj(data)['pid_type'],
        pid: [data]
      })
      if (res.errorcode === 0) {
        this.initDetail()
        this.props.RefreshData()
        this.setThisDataList(null)
        this.toggleIsTable()
      }
    }
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
        this.props.onCancel(true)
        setImmediate(() => {
          this.confirmModal.destroy()
        })
      }
    })
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
            <Button type="primary" className='addbtn-mb20' onClick={() => this.editPid()}>+ Add</Button>

            <PidTable data={this.tableData} onEdit={this.editPid} onDelete={this.deletePid} />
            <Button type="primary" className='submitBtn' onClick={this.submit}>Submit</Button>
            <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button>
          </div> : <div className="formBox">
              <FormPid
                data={this.GJB}
                addConfigGroup={this.addConfigGroup}
                onCancel={this.toggleIsTable}
                pidList={this.tableData.map(ele => ele.placement_id)}
                onSubmit={this.pidFormSubmit} />
            </div>
        }

      </div>
    )
  }
}

export default PID
