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
  filters: ILoadVideoStore.SearchParams
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, globalStore, loadVideoStore } = store
    const { setBreadcrumbArr } = globalStore
    const { filters } = loadVideoStore
    return { routerStore, setBreadcrumbArr, filters }
  }
)

@observer
class PID extends ComponentExt<IStoreProps> {

  @observable
  private loadVideo: ILoadVideoStore.IitemForList = {};

  @observable
  private currentItem: ILoadVideoStore.IItem = {}


  @observable
  private showModal: boolean = false


  @observable
  private thisDataList: ILoadVideoStore.IItem[]

  @action
  toggleModal = () => {
    this.showModal = !this.showModal
  }

  @action
  initDetail = async () => {
    try {
      const json = window.sessionStorage.getItem('edit_loadvideo_item');
      if (!json) return this.props.routerStore.replace('/loadVideo');

      this.loadVideo = JSON.parse(json);
      await this.getList()
    } catch (error) {
      console.error(error)
      this.props.routerStore.push('/loadVideo');
    }
  }


  getList = async () => {
    const { pkg_name, bundle_id, platform } = this.loadVideo
    const { template_md5, template_name } = this.props.filters
    const params = { bundle_id, pkg_name, platform, template_md5, template_name }

    const res = await this.api.loadVideo.getDetail(params)
    runInAction('Change_', () => {
      this.thisDataList = res.data
    })
  }

  @action
  addWhite = () => {
    this.currentItem = {};
    this.toggleModal();
  }

  @action
  editRecord = (item: ILoadVideoStore.IItem) => {
    if (this.checkUse(item)) return;

    this.currentItem = item;
    this.toggleModal();
  }

  delRecord = async (item: ILoadVideoStore.IItem) => {
    if (this.checkUse(item)) return;

    const id = item.id;
    Modal.confirm({
      title: 'Confirm to delete it?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: () => {
        this.api.loadVideo.delete({ id }).then(res => {
          if (res.errorcode !== 0) {
            return message.error(res.message)
          }
          message.success(res.message);
          this.getList();
        })
      }
    });
  }

  /**
   * 检查该记录是否已经被使用
   */
  checkUse = (item: ILoadVideoStore.IItem) => {
    if (item.loadvideo_id) {
      Modal.warning({
        title: 'Attention',
        content: 'It’s in use. Please remove the corresponding relation before edit it！',
      });
      return true;
    }
    return false;
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
            {
              this.loadVideo.platform === 'ios' ? <div className={style.row}>
                <div className={style.title}> Bundle ID </div>
                <div className={style.value}> {this.loadVideo.bundle_id} </div>
              </div> : <div className={style.row}>
                  <div className={style.title}> Pkg Name </div>
                  <div className={style.value}> {this.loadVideo.pkg_name} </div>
                </div>
            }
            <div className={style.row}>
              <div className={style.title}> Platform </div>
              <div className={style.value}> {this.loadVideo.platform} </div>
            </div>
          </div>
          <div className="tableBox">
            {
              this.$checkAuth('Config Manage-Template Manage', (
                <Button type="primary" className={style.addbtn} onClick={this.addWhite}>+ Add</Button>
              ))
            }
            <Table<ILoadVideoStore.IItem>
              className="center-table"
              style={{ width: '100%' }}
              bordered
              rowKey='id'
              dataSource={this.thisDataList}
              scroll={{ y: scrollY }}
            >
              <Table.Column<ILoadVideoStore.IItem>
                title="Template Name"
                dataIndex="template_name"
                width={150}
              />
              <Table.Column<ILoadVideoStore.IItem>
                title="Portrait Md5"
                dataIndex="portrait_md5"
              />
              <Table.Column<ILoadVideoStore.IItem>
                title="Portrait Url"
                dataIndex="portrait_url"
              />
              <Table.Column<ILoadVideoStore.IItem>
                title="Landscape Md5"
                dataIndex="landscape_md5"
              />
              <Table.Column<ILoadVideoStore.IItem>
                title="Landscape Url"
                dataIndex="landscape_url"
              />
              <Table.Column<ILoadVideoStore.IItem>
                key="action"
                title="Operate"
                width={120}
                render={(_, record, index) => (
                  <span>
                    <a href="javascript:;" onClick={() => this.editRecord(record)}>
                      <Icon type="form" />
                    </a>
                    {
                      this.$checkAuth('Config Manage-Template Manage', (
                        <React.Fragment>
                          <Divider key='Divider1' type="vertical" />
                          <a href="javascript:;" onClick={() => this.delRecord(record)}>
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
          currentRecord={this.loadVideo}
          visible={this.showModal}
          item={this.currentItem} />
      </div>
    )
  }
}

export default PID
