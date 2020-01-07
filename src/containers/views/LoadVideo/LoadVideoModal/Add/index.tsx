import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Select, Button, message, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { platformOption } from '@config/web'
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
  item?: ILoadVideoStore.IItem
  onOk?: () => void
  onCancel?: () => void
  visible?: boolean
  currentRecord?: ILoadVideoStore.IitemForList

  getConfig?: () => void
  clearItem?: () => void
  getSubsiteInfo?: () => void
  optionListDb?: ILoadVideoStore.OptionListDb
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IProps => {
    const { loadVideoStore, routerStore } = store
    const { optionListDb, getConfig } = loadVideoStore
    return { routerStore, optionListDb, getConfig }
  }
)
@observer
class AddModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private currentPlatform: string = ''

  @observable
  private showPortaitUrl: boolean = true;

  @observable
  private showLandscapeUrl: boolean = true;


  // @observable
  // private landscapeIsUploaded: boolean = false;

  // @observable
  // private portaitIsUploaded: boolean = false;

  @action
  componentWillReceiveProps() {
    if (this.props.visible === false) {
      this.showLandscapeUrl = true;
      this.showPortaitUrl = true;
      if (this.props.currentRecord) {
        this.setPlatform(this.props.currentRecord.platform);
      }
    }
  }

  @action
  setPlatform = (value) => {
    this.currentPlatform = value
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
  uploadChanged = (type) => {
    if (this.isEdit === false) return;
    if (type === 'portait') {
      this.showPortaitUrl = false;
    } else {
      this.showLandscapeUrl = false;
    }
  }

  // @action
  // uploadPortaitCallback = ({ data }) => {
  //   this.ptName = data.name;
  //   this.portaitIsUploaded = true;
  // }

  // @action
  // uploadLandscapeCallback = ({ data }) => {
  //   this.ptName = data.name;
  //   this.landscapeIsUploaded = true;
  // }

  onOk = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { form, item } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            let data = { message: '' }
            console.log(values)
            if (this.isEdit) {
              // 没有改动
              if (values.portrait_url === item.portrait_name && values.landscape_url === item.landscape_name) {
                this.toggleLoading();
                return this.props.onOk();
              }
              // portrait_url 表单是一个fileupload组件，在编辑情况下默认显示的是系统返回的文件名：portrait_name
              // 一旦重新上传文件，portrait_url 就从 name 变成了 url
              // 所以在修改的时候 需要重新设置回 portrait_url的值
              const formData = {
                id: this.props.item.id,
                portrait_url: item.portrait_url,
                landscape_url: item.landscape_url
              };
              values.portrait_url !== item.portrait_name && (formData.portrait_url = values.portrait_url);
              values.landscape_url !== item.landscape_name && (formData.landscape_url = values.landscape_url);

              data = await this.api.loadVideo.edit(formData)
            } else {
              data = await this.api.loadVideo.add(values)
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
    this.props.getConfig()
  }

  render() {
    const { item, form, optionListDb, currentRecord = {} } = this.props
    const { getFieldDecorator } = form
    return (
      <Modal title={`${this.isEdit ? 'Edit' : 'Add'} Load Video2.0`}
        onOk={this.onOk}
        destroyOnClose={true}
        onCancel={this.props.onCancel}
        confirmLoading={this.loading}
        visible={this.props.visible}>

        <div className='sb-form'>
          <Form className={styles.taskModal} >
            <FormItem {...formItemLayout} label="Platform">
              {this.isEdit ? item.platform : getFieldDecorator('platform', {
                initialValue: currentRecord.platform || item.bundle_id,
                rules: [{ required: true, message: "Required" }]
              })(
                <Select
                  allowClear
                  showSearch
                  disabled={!!currentRecord.platform || this.isEdit}
                  getPopupContainer={trigger => trigger.parentElement}
                  onChange={this.setPlatform}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {platformOption.map(c => {
                    return <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  })}
                </Select>
              )}
            </FormItem>
            {
              this.currentPlatform === 'ios' ? <FormItem {...formItemLayout} label="Bundle ID">
                {getFieldDecorator('bundle_id', {
                  initialValue: currentRecord.bundle_id || item.bundle_id,
                  rules: [{ required: true, message: "Required" }]
                })(
                  <Select
                    allowClear
                    showSearch
                    disabled={!!currentRecord.bundle_id || this.isEdit}
                    getPopupContainer={trigger => trigger.parentElement}
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {optionListDb.ios.map(c => {
                      return <Select.Option key={c} value={c}>
                        {c}
                      </Select.Option>
                    })}
                  </Select>
                )}
              </FormItem> : <FormItem {...formItemLayout} label="Pkg Name">
                  {getFieldDecorator('pkg_name', {
                    initialValue: currentRecord.pkg_name || item.pkg_name,
                    rules: [{ required: true, message: "Required" }]
                  })(
                    <Select
                      allowClear
                      showSearch
                      disabled={!!currentRecord.pkg_name || this.isEdit}
                      getPopupContainer={trigger => trigger.parentElement}
                      filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {optionListDb.android.map(c => {
                        return <Select.Option key={c} value={c}>
                          {c}
                        </Select.Option>
                      })}
                    </Select>
                  )}
                </FormItem>
            }
            <FormItem {...formItemLayout} label="Template Name">
              {getFieldDecorator('template_name', {
                initialValue: item.template_name,
                rules: [{ required: true, message: "Required" }]
              })(<Input disabled={this.isEdit} />)}
            </FormItem>

            <FormItem {...formItemLayout} label="Portrait">
              {getFieldDecorator('portrait_url', {
                initialValue: this.isEdit ? item.portrait_name : item.portrait_url,
                rules: [{ required: true, message: "Required" }]
              })(<UploadFile fileType='.mp4'
                showPreviewUrl={true}
                isZip={true}
                preData={{ type: 15 }}
                api={this.api.util.uploadLoadVideo}
                onChange={() => this.uploadChanged('portait')}
                // callBack={this.uploadPortaitCallback}
                noCopy={true}>
                <Button>
                  <MyIcon type="iconshangchuan1" /> Upload </Button>
              </UploadFile>)}
            </FormItem>
            {
              this.isEdit && this.showPortaitUrl
              && <>
                <FormItem {...formItemLayout} className={styles.autoHeight} label="Portrait Url">
                  {item.portrait_url}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.autoHeight} label="Portrait Pt Md5">
                  {item.portrait_md5}
                </FormItem>
              </>
            }
            <FormItem {...formItemLayout} label="Landscape">
              {getFieldDecorator('landscape_url', {
                initialValue: this.isEdit ? item.landscape_name : item.landscape_url,
                rules: [{ required: true, message: "Required" }]
              })(<UploadFile fileType='.mp4'
                showPreviewUrl={true}
                isZip={true}
                api={this.api.util.uploadLoadVideo}
                preData={{ type: 15 }}
                onChange={() => this.uploadChanged('landscape')}
                // callBack={this.uploadLandscapeCallback}
                noCopy={true}>
                <Button>
                  <MyIcon type="iconshangchuan1" /> Upload </Button>
              </UploadFile>)}
            </FormItem>
            {
              this.isEdit && this.showLandscapeUrl
              && <>
                <FormItem {...formItemLayout} className={styles.autoHeight} label="Landscape Url">
                  {item.landscape_url}
                </FormItem>
                <FormItem {...formItemLayout} className={styles.autoHeight} label="Landscape Pt Md5">
                  {item.landscape_md5}
                </FormItem>
              </>
            }
          </Form>
        </div >
      </Modal>
    )
  }
}

export default Form.create<IProps>()(AddModal)
