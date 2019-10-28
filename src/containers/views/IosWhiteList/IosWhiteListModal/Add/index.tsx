import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Select, Button, message, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import UploadFile from '@components/UploadFile'
import MyIcon from '@components/Icon'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xl: { span: 6 }
  },
  wrapperCol: {
    xl: { span: 16 }
  }
}


interface IProps {
  item?: IIosWhiteListStore.IItem
  onOk?: () => void
  onCancel?: () => void
  visible?: boolean
  bundle_id?: string

  getBundleIds?: () => void
  clearItem?: () => void
  getSubsiteInfo?: () => void
  optionListDb?: IIosWhiteListStore.OptionListDb
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IProps => {
    const { iosWhiteListStore, routerStore } = store
    const { optionListDb, getBundleIds } = iosWhiteListStore
    return { routerStore, optionListDb, getBundleIds }
  }
)
@observer
class whiteListModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private showPtUrl: boolean = true;

  @observable
  private ptName: string = '';

  @observable
  private isUploaded: boolean = false;

  @action
  componentWillReceiveProps() {
    if (this.props.visible === false) {
      this.isUploaded = false;
    }
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @computed
  get isEdit() {
    return !!(this.props.item && this.props.item.id)
  }

  @action
  uploadChanged = (value) => {
    if (this.isEdit === false) return;
    this.showPtUrl = !!value;
  }

  @action
  uploadCallback = ({ data }) => {
    this.ptName = data.name;
    this.isUploaded = true;
  }

  onOk = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            let data = { message: '' }
            values.platform = 'ios'
            if (this.isEdit) {
              if (this.isUploaded === false) {
                this.toggleLoading();
                return this.props.onOk();
              }
              data = await this.api.ioswhitelist.edit({
                pt_url: values.pt_url,
                pt_name: this.ptName,
                id: this.props.item.id
              })
            } else {
              // 检查version字段中是不是V开头
              if (values.version.toLocaleLowerCase()[0] !== 'v') {
                values.version = 'v' + values.version
              }
              values.pt_name = this.ptName;
              data = await this.api.ioswhitelist.create(values)
            }
            message.success(data.message)
            this.props.onOk();
          } catch (err) {
            console.error(err);
          }
          this.toggleLoading()
        }
      }
    )
  }

  componentWillMount() {
    this.props.getBundleIds()
  }

  render() {
    const { item, form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <Modal title={`${this.isEdit ? 'Edit' : 'Add'} iOS Whitelist`}
        onOk={this.onOk}
        destroyOnClose={true}
        onCancel={this.props.onCancel}
        confirmLoading={this.loading}
        visible={this.props.visible}>

        <div className='sb-form'>
          <Form className={styles.taskModal} >
            <FormItem {...formItemLayout} label="Platform">ios</FormItem>
            <FormItem {...formItemLayout} label="Bundle ID">
              {getFieldDecorator('bundle_id', {
                initialValue: this.props.bundle_id || item.bundle_id,
                rules: [{ required: true, message: "Required" }]
              })(
                <Select
                  allowClear
                  showSearch
                  disabled={!!this.props.bundle_id || this.isEdit}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.bundle_ids.map(c => {
                    return <Select.Option key={c} value={c}>
                      {c}
                    </Select.Option>
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="Version">
              {getFieldDecorator('version', {
                initialValue: item.version,
                rules: [{ required: true, message: "Required" }]
              })(<Input disabled={this.isEdit} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Ping Protocol(Pt)">
              {getFieldDecorator('pt_url', {
                initialValue: this.isEdit ? item.pt_name : item.pt_url,
                rules: [{ required: true, message: "Required" }]
              })(<UploadFile fileType='.json'
                showPreviewUrl={true}
                api={this.api.util.uploadIosWhite}
                onChange={this.uploadChanged}
                callBack={this.uploadCallback}
                noCopy={true}>
                <Button>
                  <MyIcon type="iconshangchuan1" /> Upload </Button>
              </UploadFile>)}
            </FormItem>
            {
              this.isEdit && this.showPtUrl && !this.isUploaded && <FormItem {...formItemLayout} label="Pt Url">
                {item.pt_url}
              </FormItem>
            }
          </Form>
        </div >
      </Modal>
    )
  }
}

export default Form.create<IProps>()(whiteListModal)
