import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon, Popover, Divider } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '@config/web'
import FormAdd from '../Add'
import * as style from './index.scss'

interface TableProps {
  onEdit: (index: number) => void
  onCopy: (index: number) => void
  data: any[]
}


@observer
class VcTable extends ComponentExt<TableProps> {

  render() {
    const { data, onEdit, onCopy } = this.props;

    return (
      <Table<ICreativeStore.ICreative>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey='id'
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<ICreativeStore.ICreative>
          key="id"
          title="ID"
          dataIndex="id"
          width={100}
        />
        <Table.Column<ICreativeStore.ICreative>
          key="creative_type"
          title="Creative Type"
          dataIndex="creative_type"
          width={100}
        />
        <Table.Column<ICreativeStore.ICreative>
          key="creative_name"
          title="Creative Name"
          dataIndex="creative_name"
          width={200}
        />

        <Table.Column<ICreativeStore.ICreative>
          key="version"
          title="Creative Version"
          dataIndex="version"
          width={200}
        />
        <Table.Column<ICreativeStore.ICreative>
          key="language"
          title="Creative Language"
          dataIndex="language"
          width={100} />

        <Table.Column<ICreativeStore.ICreative>
          key="status"
          title="Status"
          dataIndex="status"
          render={(_) => (
            statusOption.find(item => item.value === _).key
          )}
          width={100} />

        <Table.Column<ICreativeStore.ICreative>
          key="action"
          title="Operate"
          width={120}
          render={(_, record, index) => (
            <span>
              <a href="javascript:;" onClick={() => onEdit(index)}>
                <Icon type="form" />
              </a>
              {
                this.$checkAuth('Offers-Creatives-Creatives-Add', (
                  <React.Fragment>
                    <Divider key='Divider1' type="vertical" />

                    <a href="javascript:;" onClick={() => onCopy(index)}>
                      <Icon type="copy" />
                    </a>
                  </React.Fragment>
                ))
              }

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
  private app_key: string

  @observable
  private targetCreative: ICreativeStore.ICreativeForList = {}

  @observable
  private GJB: ICreativeStore.ICreative

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: ICreativeStore.ICreative[]

  @action
  toggleIsTable = (type?: boolean) => {
    const value = type === undefined ? !this.isTable : type
    let arr = [
      {
        title: 'Creative',
        path: "/creative"
      },
      {
        title: 'Edit Creative',
        onClick: () => {
          this.toggleIsTable(true)
        }
      }
    ] as IGlobalStore.menu[]
    if (!value) {
      arr.push({
        title: this.GJB.id ? `Edit ${this.GJB.creative_name}` : 'Add'
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
      const creativeStr = localStorage.getItem('TargetCreative') || '{}';
      const creative = JSON.parse(creativeStr)
      const { routerStore } = this.props

      runInAction('Change_', () => {
        this.targetCreative = creative
      })
      // const state = routerStore.location.state
      // if (state && state.type) {
      //   // this.editPid()
      // } else {

      // }

      const routerId = routerStore.location.pathname.toString().split('/').pop()

      const Detail = await this.api.creative.getCreative({ app_key: routerId })
      runInAction('Change_', () => {
        this.thisDataList = Detail.data
        this.app_key = routerId
      })

    } catch (error) {
      this.props.routerStore.push('/creative');
    }
  }

  submit = () => {
    this.props.routerStore.push('/creative');
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  onOK = (id: number) => {
    this.initDetail()
    this.toggleIsTable()
  }

  editPid = (index?) => {
    const data = index === undefined ? this.targetCreative : this.thisDataList[index]
    runInAction('set_GJB', () => {
      this.GJB = data
    })
    this.toggleIsTable()
  }

  onCopy = async (index: number) => {
    await this.api.creative.copyCreative({ id: this.thisDataList[index].id })
    this.initDetail()
  }
  lastStep = () => {
    this.props.routerStore.push('/creative');
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
                App ID
                    </div>
              <div className={style.value}>
                {this.targetCreative.app_id}
              </div>
            </div>
            <div className={style.row}>
              <div className={style.title}>
                Platform
                    </div>
              <div className={style.value}>
                {this.targetCreative.platform}
              </div>
            </div>
          </div>
          {
            this.isTable ? <div className="tableBox">
              {
                this.$checkAuth('Offers-Creatives-Creatives-Add', (
                  <Button type="primary" className={style.addbtn} onClick={() => this.editPid()}>+ Add</Button>
                ))
              }
              <VcTable data={this.thisDataList} onEdit={this.editPid} onCopy={this.onCopy} />
              {/* <div className={style.btnGroup}> */}
              {/* <Button type="primary" className={style.submitBtn} onClick={this.submit}>Submit</Button> */}
              {/* <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button> */}
              {/* </div> */}
            </div> : <div className="formBox">
                <FormAdd
                  onCancel={this.onCancel}
                  onOk={this.onOK}
                  creativeId={this.GJB.id}
                  app_key={this.app_key}
                  platform={this.targetCreative.platform}
                  creative={this.GJB} />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default PID
