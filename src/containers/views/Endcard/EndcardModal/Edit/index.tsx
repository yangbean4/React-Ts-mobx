import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '@config/web'
import FormAdd from '../Add'
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
      <Table<IEndcardStore.IEndcard>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey='id'
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<IEndcardStore.IEndcard>
          key="vc_name"
          title="VC Name"
          dataIndex="vc_name"
          width={200}
        />
        <Table.Column<IEndcardStore.IEndcard>
          key="vc_exchange_rate"
          title="VC Exchang Rate"
          dataIndex="vc_exchange_rate"
          render={(_) => (
            `${_}=1$`
          )}
          width={200} />
        <Table.Column<IEndcardStore.IEndcard> key="vc_callback_url" title="VC Callback Url" dataIndex="vc_callback_url" width={200} />
        <Table.Column<IEndcardStore.IEndcard>
          key="status"
          title="Status"
          dataIndex="status"
          render={(_) => (
            statusOption.find(item => item.value === _).key
          )}
          width={200} />

        <Table.Column<IEndcardStore.IEndcard>
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


interface IStoreProps {
  routerStore: RouterStore
  setBreadcrumbArr?: (menus?: IGlobalStore.menu[]) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, globalStore } = store
    const { setBreadcrumbArr } = globalStore
    return { routerStore, setBreadcrumbArr }
  }
)

@observer
class PID extends ComponentExt<IStoreProps> {

  @observable
  private targetEndcard: IEndcardStore.IEndcardForList = {}

  @observable
  private GJB: IEndcardStore.IEndcard

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: IEndcardStore.IEndcard[]

  @action
  toggleIsTable = (type?: boolean) => {
    const value = type === undefined ? !this.isTable : type
    let arr = [
      {
        title: 'Virtual Endcard',
        path: "/endcard"
      },
      {
        title: 'Edit Virtual Endcard',
        onClick: () => {
          this.toggleIsTable(true)
        }
      }
    ] as IGlobalStore.menu[]
    if (!value) {
      arr.push({
        title: this.GJB.id ? `Edit ${this.GJB.vc_name}` : 'Add'
      })
    }
    this.props.setBreadcrumbArr(arr)
    this.isTable = value
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  initDetail = async () => {
    try {
      const endcardStr = localStorage.getItem('TargetEndcard') || '{}';
      const endcard = JSON.parse(endcardStr)
      runInAction('Change_', () => {
        this.targetEndcard = endcard
      })
      const state = this.props.routerStore.location.state
      if (state && state.type) {
        this.editPid()
      } else {
        const Detail = await this.api.endcard.getEndcardInfo(endcard)
        runInAction('Change_', () => {
          this.thisDataList = Detail.data
        })
      }
    } catch (error) {
      this.props.routerStore.push('/endcard');
    }
  }

  submit = () => {
    this.props.routerStore.push('/endcard');
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  onOK = (id: number) => {
    this.initDetail()
    this.toggleIsTable()
  }

  editPid = (index?) => {
    const data = index === undefined ? {} : this.thisDataList[index]
    runInAction('set_GJB', () => {
      this.GJB = data
    })
    this.toggleIsTable()
  }

  lastStep = () => {
    this.props.routerStore.push('/endcard');
  }

  componentWillMount() {
    this.initDetail()
  }

  componentWillUnmount() {
    this.props.setBreadcrumbArr()
  }

  render() {
    // const { form, editData } = this.props
    return (
      <div className='PID'>
        <div className={style.box}>
          <div className={style.head}>
            <div className={style.row}>
              <div className={style.title}>
                App Name
                    </div>
              <div className={style.value}>
                {this.targetEndcard.app_name}
              </div>
            </div>
            <div className={style.row}>
              <div className={style.title}>
                Pkg Name
                    </div>
              <div className={style.value}>
                {this.targetEndcard.pkg_name}
              </div>
            </div>
            <div className={style.row}>
              <div className={style.title}>
                Platform
                    </div>
              <div className={style.value}>
                {this.targetEndcard.platform}
              </div>
            </div>
          </div>
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
                  onCancel={this.onCancel}
                  onOk={this.onOK}
                  endcard={this.GJB} />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default PID
