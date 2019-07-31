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
  data: any[]
}


@observer
class VcTable extends ComponentExt<TableProps> {

  render() {
    const { data, onEdit } = this.props;

    return (
      <Table<ILeadContentStore.ILeadContent>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey='id'
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<ILeadContentStore.ILeadContent>
          key="id"
          title="Id"
          dataIndex="id"
          width={100}
        />
        <Table.Column<ILeadContentStore.ILeadContent>
          key="name"
          title="Lead Name"
          dataIndex="name"
          width={200}
        />
        <Table.Column<ILeadContentStore.ILeadContent>
          key="content"
          title="Lead Content url"
          dataIndex="content"
          width={200}
        />
        <Table.Column<ILeadContentStore.ILeadContent>
          key="content_md5"
          title="MD5"
          dataIndex="content_md5"
          width={200}
        />

        <Table.Column<ILeadContentStore.ILeadContent>
          key="status"
          title="Status"
          dataIndex="status"
          render={(_) => (
            statusOption.find(item => item.value === _).key
          )}
          width={200} />

        <Table.Column<ILeadContentStore.ILeadContent>
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
  private app_key: string

  @observable
  private targetLeadContent: ILeadContentStore.ILeadContentForList = {}

  @observable
  private GJB: ILeadContentStore.ILeadContent

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: ILeadContentStore.ILeadContent[]

  @action
  toggleIsTable = (type?: boolean) => {
    const value = type === undefined ? !this.isTable : type
    let arr = [
      {
        title: 'LeadContent',
        path: "/leadContent"
      },
      {
        title: 'Edit LeadContent',
        onClick: () => {
          this.toggleIsTable(true)
        }
      }
    ] as IGlobalStore.menu[]
    if (!value) {
      arr.push({
        title: this.GJB.id ? `Edit ${this.GJB.name}` : 'Add'
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
      const leadContentStr = localStorage.getItem('TargetLeadContent') || '{}';
      const leadContent = JSON.parse(leadContentStr)
      const { routerStore } = this.props

      runInAction('Change_', () => {
        this.targetLeadContent = leadContent
      })
      // const state = routerStore.location.state
      // if (state && state.type) {
      //   // this.editPid()
      // } else {

      // }

      const routerId = routerStore.location.pathname.toString().split('/').pop()

      const Detail = await this.api.leadContent.getLeadContent({ app_key: routerId })
      runInAction('Change_', () => {
        this.thisDataList = Detail.data
        this.app_key = routerId
      })

    } catch (error) {
      this.props.routerStore.push('/leadContent');
    }
  }

  submit = () => {
    this.props.routerStore.push('/leadContent');
  }

  onCancel = () => {
    this.toggleIsTable()
  }
  onOK = (id: number) => {
    this.initDetail()
    this.toggleIsTable()
  }

  editPid = (index?) => {
    const data = index === undefined ? this.targetLeadContent : this.thisDataList[index]
    runInAction('set_GJB', () => {
      this.GJB = data
    })
    this.toggleIsTable()
  }

  lastStep = () => {
    this.props.routerStore.push('/leadContent');
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
                {this.targetLeadContent.app_id}
              </div>
            </div>
            <div className={style.row}>
              <div className={style.title}>
                Platform
                    </div>
              <div className={style.value}>
                {this.targetLeadContent.platform}
              </div>
            </div>
          </div>
          {
            this.isTable ? <div className="tableBox">
              {
                this.$checkAuth('Offers-Creatives-Lead Content-Add', (
                  <Button type="primary" className={style.addbtn} onClick={() => this.editPid()}>+ Add</Button>
                ))
              }
              <VcTable data={this.thisDataList} onEdit={this.editPid} />
              {/* <div className={style.btnGroup}> */}
              {/* <Button type="primary" className={style.submitBtn} onClick={this.submit}>Submit</Button> */}
              {/* <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button> */}
              {/* </div> */}
            </div> : <div className="formBox">
                <FormAdd
                  onCancel={this.onCancel}
                  onOk={this.onOK}
                  leadContentId={this.GJB.id}
                  app_key={this.app_key}
                  platform={this.targetLeadContent.platform}
                  leadContent={this.GJB} />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default PID
