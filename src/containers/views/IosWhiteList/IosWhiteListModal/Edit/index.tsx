import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Button, Table, Icon, Divider, Modal, message } from 'antd'
import { ComponentExt } from '@utils/reactExt'
import * as style from './index.scss'
import AddForm from '../Add';


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
  private bundle_id: string

  @observable
  private currentItem: IIosWhiteListStore.IItem = {}


  @observable
  private showModal: boolean = false


  @observable
  private thisDataList: IIosWhiteListStore.IItem[]

  @action
  toggleModal = () => {
    this.showModal = !this.showModal
  }

  @action
  initDetail = async () => {
    try {
      const { routerStore } = this.props
      const bundle_id = routerStore.location.pathname.toString().split('/').pop()
      this.bundle_id = bundle_id
      this.getList()
    } catch (error) {
      console.log(error)
      this.props.routerStore.push('/iosWhitelist');
    }
  }


  getList = async () => {
    const Detail = await this.api.ioswhitelist.getIosWhite({
      bundle_id: this.bundle_id
    })
    runInAction('Change_', () => {
      this.thisDataList = Detail.data
    })
  }

  @action
  addWhite = () => {
    this.currentItem = {};
    this.toggleModal();
  }

  @action
  editWhite = (item) => {
    this.currentItem = item;
    this.toggleModal();
  }

  delWhite = async (item: IIosWhiteListStore.IItem) => {
    let id = item.id;

    let res = await this.api.ioswhitelist.del({ id, check: 1 });
    if (res.errorcode !== 0) return message.error(res.message);

    Modal.confirm({
      title: 'Confirm to delete it?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: () => {
        this.api.ioswhitelist.del({ id, check: 0 }).then(res => {
          if (res.errorcode !== 0) {
            return message.error(res.message)
          }
          message.success(res.message);
          this.getList();
        })
      }
    });
  }

  @action
  onOk = () => {
    this.getList();
    this.toggleModal();
  }

  componentWillMount() {
    this.initDetail()
  }

  componentWillUnmount() {
    this.props.setBreadcrumbArr()
  }

  render() {
    return (
      <div className='PID'>
        <div className={style.box}>
          <div className={style.head}>
            <div className={style.row}>
              <div className={style.title}> Bundle ID </div>
              <div className={style.value}> {this.bundle_id} </div>
            </div>
            <div className={style.row}>
              <div className={style.title}> Platform </div>
              <div className={style.value}> ios </div>
            </div>
          </div>
          <div className="tableBox">
            {
              this.$checkAuth('Offers-Creatives-Creatives-Add', (
                <Button type="primary" className={style.addbtn} onClick={this.addWhite}>+ Add</Button>
              ))
            }
            <Table<IIosWhiteListStore.IItem>
              className="center-table"
              style={{ width: '100%' }}
              bordered
              rowKey='id'
              dataSource={this.thisDataList}
              scroll={{ y: scrollY }}
            >
              <Table.Column<IIosWhiteListStore.IItem>
                title="Version"
                dataIndex="version"
                width={100}
              />
              <Table.Column<IIosWhiteListStore.IItem>
                title="Pt Url"
                dataIndex="pt_url"
              />
              <Table.Column<IIosWhiteListStore.IItem>
                key="action"
                title="Operate"
                width={120}
                render={(_, record, index) => (
                  <span>
                    <a href="javascript:;" onClick={() => this.editWhite(record)}>
                      <Icon type="form" />
                    </a>
                    {
                      this.$checkAuth('Config Manage-IOS Whitelist-Delete', (
                        <React.Fragment>
                          <Divider key='Divider1' type="vertical" />
                          <a href="javascript:;" onClick={() => this.delWhite(record)}>
                            <Icon type="delete" />
                          </a>
                        </React.Fragment>
                      ))
                    }
                  </span>
                )}
              />
            </Table>
          </div>
        </div>
        <AddForm
          onOk={this.onOk}
          onCancel={this.toggleModal}
          bundle_id={this.bundle_id}
          visible={this.showModal}
          item={this.currentItem} />
      </div>
    )
  }
}

export default PID
