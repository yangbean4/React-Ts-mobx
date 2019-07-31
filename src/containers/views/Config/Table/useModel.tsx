import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Button, Select, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { useType, titleTarget } from './useType'
import { statusOption } from '../as.config'
import * as styles from './index.scss'
import Icon from '@components/Icon'
const FormItem = Form.Item

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12
  }
}

interface IStoreProps {
  pkgNameAndBundleId?: IConfigStore.iosAndAnd
  getAllConfig?: () => Promise<any>
}

interface IProps extends IStoreProps {
  type: useType
  visible: boolean
  targetConfig: IConfigStore.IConfig
  onCancel: () => void
  onOk: (data) => void

}

@inject(
  (store: IStore): IStoreProps => {
    const { configStore } = store
    const { pkgNameAndBundleId, getAllConfig } = configStore
    return { pkgNameAndBundleId, getAllConfig }
  }
)

@observer
class ConfigModel extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false


  @observable
  private typeIsAdd: boolean = false

  @computed
  get modelTitle() {
    return titleTarget[this.props.type]
  }

  @observable
  private platform: string

  @computed
  get usePlatform() {
    return this.platform || this.props.targetConfig.platform || 'android'
  }

  @computed
  get usePkgnameData() {
    return this.props.pkgNameAndBundleId[this.usePlatform]
  }

  @action
  setPlatform = (type) => {
    this.platform = type
    this.props.form.setFieldsValue({
      pkg_name: ''
    })
  }

  @action
  toggleAddType = () => {
    this.typeIsAdd = !this.typeIsAdd
  }
  @action
  toggleLoading = (type?) => {
    this.loading = type === undefined ? !this.loading : type;
  }

  submit = (e?: React.FormEvent<any>): void => {
    this.toggleLoading(true)
    if (e) {
      e.preventDefault()
    }
    const { form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        let per = values;
        per.config_version = per.config_version ? `v${per.config_version}` : per.config_version
        per.copyTo = per.copyTo ? `v${per.copyTo}` : per.copyTo
        per.pkg_name = this.usePkgnameData[per.pkg_name]
        const cb = () => {

          this.props.onOk(per)
          this.props.form.resetFields()
        }
        if (!err) {
          if (this.props.type === 'copy' && this.props.targetConfig.versionArr.find(ele => ele.version === per.copyTo)) {
            this.$message.error(`${per.copyTo} is already exist!`)
            this.toggleLoading(false)
            return
          }
          if (this.props.type === 'add') {
            try {
              await this.api.config.checkConfig(per)
              cb()
            } catch (error) {
              this.toggleLoading(false)
            }
          } else {
            cb()
          }

        }

        this.toggleLoading(false)
      }
    )
  }
  onCancel = () => {
    this.props.form.resetFields()
    this.props.onCancel()
  }
  componentWillMount() {
    this.props.getAllConfig()
  }

  render() {
    const { form, visible, targetConfig, type } = this.props
    const { getFieldDecorator } = form

    return (
      <Modal
        title={this.modelTitle}
        width={640}
        visible={visible}
        onCancel={this.onCancel}
        footer={[
          <Button key="submit" loading={this.loading} type="primary" onClick={this.submit}>
            Submit
          </Button>,
        ]}
      >

        <Form {...layout} >

          <FormItem label="Platform">
            {
              type !== 'add' ? <p>{targetConfig.platform}</p>
                : getFieldDecorator('platform', {
                  initialValue: this.usePlatform,
                  rules: [
                    {
                      required: true, message: "Required"
                    }
                  ]
                })(
                  <Select
                    allowClear
                    showSearch
                    onChange={(val) => this.setPlatform(val)}
                    getPopupContainer={trigger => trigger.parentElement}
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    {(statusOption).map(c => (
                      <Select.Option {...c}>
                        {c.key}
                      </Select.Option>
                    ))}
                  </Select>
                )
            }

          </FormItem>


          <FormItem label={this.usePlatform === 'android' ? "Pkg Name" : "Bundle Id"}>
            {
              type !== 'add' ? <p>{targetConfig.pkg_name}</p>
                : this.typeIsAdd ? [getFieldDecorator('pkg_name', {
                  rules: [
                    {
                      required: true, message: "Required"
                    }
                  ]
                })(<Input autoComplete="off" className={styles.minInput} key='input' />)
                  , <Icon onClick={this.toggleAddType} className={styles.workBtn} key="iconxia" type='iconxia' />
                ]

                  : [
                    getFieldDecorator('pkg_name', {
                      rules: [
                        {
                          required: true, message: "Required"
                        }
                      ]
                    })(
                      <Select
                        allowClear
                        showSearch
                        getPopupContainer={trigger => trigger.parentElement}
                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        // className={styles.minInput}
                        key='select'>
                        {this.usePkgnameData.map((c, index) => (
                          <Select.Option value={index} key={index}>
                            {c}
                          </Select.Option>
                        ))}
                      </Select>
                    )
                    // , <Icon className={styles.workBtn} onClick={this.toggleAddType} key='iconxinzeng1' type='iconxinzeng1' />
                  ]
            }
          </FormItem>

          <FormItem label="Config Version">
            {
              type !== 'add' ? getFieldDecorator('id', {
                rules: [
                  {
                    required: true, message: "Required"
                  }
                ]
              })(
                <Select
                  allowClear
                  showSearch
                  mode={type === 'delete' ? 'multiple' : ''}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {(targetConfig.versionArr || []).map(c => (
                    <Select.Option key={c.version} value={c.id}>
                      {c.version}
                    </Select.Option>
                  ))}
                </Select>
              ) : getFieldDecorator('config_version', {
                rules: [
                  {
                    required: true, message: "Required"
                  }
                ]
              })(
                <Input autoComplete="off" />
              )

            }
          </FormItem>
          {
            type === 'copy' ? <FormItem label="New Config Version">
              {getFieldDecorator('copyTo', {
                rules: [
                  {
                    required: true, message: "Required",
                  }
                ]
              })(
                <Input autoComplete="off" />
              )}
            </FormItem> : null
          }
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IProps>()(ConfigModel)
