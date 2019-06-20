import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon, Divider, message } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../../web.config'
import FormAdd from '../Add'
import * as style from './index.scss'
import { routerStore } from 'store';
interface TableProps {
  onEdit: (index: number) => void
  copyData: (index: number) => void
  data: any[]
}


@observer
class VcTable extends ComponentExt<TableProps> {

  render() {
    const { data, onEdit, copyData } = this.props;

    return (
      <Table<ICampaignStore.ICampaignGroup>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey="edit_id"
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<ICampaignStore.ICampaignGroup> key="id"title="ID" dataIndex="id" width={200}/>
        <Table.Column<ICampaignStore.ICampaignGroup> key="campaign_name" title="Campaign Name" dataIndex="campaign_name" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="target_code" title="Target Code" dataIndex="target_code" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="bid" title="Bid" dataIndex="bid" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="total_budget" title="Total Budget" dataIndex="total_budget" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="daily_budget" title="Daily Budge" dataIndex="daily_budget" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="user_name" title="SEN Account" dataIndex="user_name" width={200} />        
        <Table.Column<ICampaignStore.ICampaignGroup> key="start_time" title="Start Time" dataIndex="start_time" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup> key="end_time" title="End  Time" dataIndex="end_time" width={200} />
        <Table.Column<ICampaignStore.ICampaignGroup>
          key="status"
          title="Status"
          dataIndex="status"
          render={(_) => (
            statusOption.find(item => item.value === _).key
          )}
          width={200} />

        <Table.Column<ICampaignStore.ICampaignGroup>
          key="action"
          title="Operate"
          width={120}
          render={(_, record, index) => (
            <span>
              {
                this.$checkAuth('Authorization-User Manage-Edit', [
                  <a href="javascript:;" onClick={() => onEdit(index)}>
                    <Icon type="form" />
                  </a>
                ])         
              }
              {
                <Divider key='Divider' type="vertical" />
              }
              {
                this.$checkAuth('Authorization-User', (
                  <a href="javascript:;" onClick={() => copyData(index)}>
                      <Icon type='form' />
                  </a>
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
  setCampaingn?:(Apps: ICampaignStore.ICampaignGroup) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, globalStore, campaignStore } = store
    const { setCampaingn } = campaignStore
    const { setBreadcrumbArr } = globalStore
    return { routerStore, setBreadcrumbArr }
  }
)

@observer
class PID extends ComponentExt<IStoreProps> {

  @observable
  private targetCampaigns: ICampaignStore.ICampainginForList = {}

  @observable
  private GJB: ICampaignStore.ICampaignGroup

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: ICampaignStore.ICampaignGroup[]

  @action
  toggleIsTable = (type?: boolean) => {
    const value = type === undefined ? !this.isTable : type
    let arr = [
      {
        title: 'Campaigns',
        path: "/campaigns"
      },
      {
        title: 'Edit Campaigns',
        onClick: () => {
          this.toggleIsTable(true)
        }
      }
    ] as IGlobalStore.menu[]
    if (!value) {
      arr.push({
        title: this.GJB.id ? `Edit ${this.GJB.campaign_name}` : 'Add'
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
      const TargetCampaign = localStorage.getItem('TargetCampaign') || '{}';
      const campaingn = JSON.parse(TargetCampaign)
      runInAction('Change_', () => {
        this.targetCampaigns = campaingn
      })
      const state = this.props.routerStore.location.state
      if (state && state.type) {
        this.editPid()
      } else {
        const Detail = await this.api.campaigns.getCampaignsList(campaingn)
        runInAction('Change_', () => {
          this.thisDataList = Detail.data
        })
      }
    } catch (error) {
      this.props.routerStore.push('/campaigns');
    }
  }

  submit = () => {
    this.props.routerStore.push('/campaigns');
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

  copyPid = async(index) => {
    const id = index === undefined ? '' : this.thisDataList[index].id
    const res = await this.api.campaigns.copyCampaignsSubmit({id: id})
    if (res.errorcode === 0) {
      this.initDetail()
      message.success(res.message)
    }
  }

  lastStep = () => {
    this.props.routerStore.push('/campaigns');
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
                {this.targetCampaigns.app_id}
              </div>
            </div>
            {/* <div className={style.row}>
              <div className={style.title}>
                Pkg Name
                    </div>
              <div className={style.value}>
                {this.targetCampaigns.pkg_name}
              </div>
            </div> */}
            <div className={style.row}>
              <div className={style.title}>
                Platform
                    </div>
              <div className={style.value}>
                {this.targetCampaigns.platform}
              </div>
            </div>
          </div>
          {
            this.isTable ? <div className="tableBox">
              <Button type="primary" className={style.addbtn} onClick={() => this.editPid()}>+ Add</Button>
              <VcTable data={this.thisDataList} onEdit={this.editPid} copyData={this.copyPid} />
              <div className={style.btnGroup}>
                {/* <Button type="primary" className={style.submitBtn} onClick={this.submit}>Submit</Button> */}
                {/* <Button className='cancelBtn' onClick={this.lastStep}>Last Step</Button> */}
              </div>
            </div> : <div className="formBox">
                <FormAdd
                  onCancel={this.onCancel}
                  onOk={this.onOK}
                  campaign={this.GJB} />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default PID
