import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../../web.config'
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
      <Table<ICurrencyStore.ICurrency>
        className="center-table"
        style={{ width: '100%' }}
        bordered
        rowKey='id'
        dataSource={data}
        scroll={{ y: scrollY }}
      >
        <Table.Column<ICurrencyStore.ICurrency>
          key="vc_name"
          title="VC Name"
          dataIndex="vc_name"
          width={200}
        />
        <Table.Column<ICurrencyStore.ICurrency>
          key="vc_exchange_rate"
          title="VC Exchang Rate"
          dataIndex="vc_exchange_rate"
          render={(_) => (
            `${_}=1$`
          )}
          width={200} />
        <Table.Column<ICurrencyStore.ICurrency> key="vc_callback_url" title="VC Callback Url" dataIndex="vc_callback_url" width={200} />
        <Table.Column<ICurrencyStore.ICurrency>
          key="status"
          title="Status"
          dataIndex="status"
          render={(_) => (
            statusOption.find(item => item.value === _).key
          )}
          width={200} />

        <Table.Column<ICurrencyStore.ICurrency>
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
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    return { routerStore }
  }
)

@observer
class PID extends ComponentExt<IStoreProps> {

  @observable
  private targetCurrency: ICurrencyStore.ICurrencyForList = {}

  @observable
  private GJB: ICurrencyStore.ICurrency

  @observable
  private loading: boolean = false

  @observable
  private isTable: boolean = true

  @observable
  private thisDataList: ICurrencyStore.ICurrency[]

  @action
  toggleIsTable = () => {
    this.isTable = !this.isTable
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  initDetail = async () => {
    try {
      const currencyStr = localStorage.getItem('TargetCurrency') || '{}';
      const currency = JSON.parse(currencyStr)
      runInAction('Change_', () => {
        this.targetCurrency = currency
      })
      const state = this.props.routerStore.location.state
      if (state && state.type) {
        this.editPid()
      } else {
        const Detail = await this.api.currency.getCurrencyInfo(currency)
        runInAction('Change_', () => {
          this.thisDataList = Detail.data
        })
      }
    } catch (error) {
      this.props.routerStore.push('/currency');
    }
  }

  submit = () => {
    this.props.routerStore.push('/currency');
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
    this.props.routerStore.push('/currency');
  }

  componentWillMount() {
    this.initDetail()
  }

  render() {
    // const { form, editData } = this.props
    return (
      <div className='PID'>
        <div className={style.box}>
          <div className={style.head}>
            <div className={style.row}>
              <div className={style.title}>
                Pkg Name
                    </div>
              <div className={style.value}>
                {this.targetCurrency.pkg_name}
              </div>
            </div>
            <div className={style.row}>
              <div className={style.title}>
                Platform
                    </div>
              <div className={style.value}>
                {this.targetCurrency.platform}
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
                  currency={this.GJB} />
              </div>
          }
        </div>
      </div>
    )
  }
}

export default PID
