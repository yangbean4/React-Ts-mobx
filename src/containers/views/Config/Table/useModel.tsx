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
  allConfig?: string[]
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
    const { allConfig, getAllConfig } = configStore
    return { allConfig, getAllConfig }
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

  @action
  toggleAddType = () => {
    this.typeIsAdd = !this.typeIsAdd
  }
  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.props.onOk(values)
          this.props.form.resetFields()
        }
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
          <Button key="submit" type="primary" onClick={this.submit}>
            Submit
          </Button>,
        ]}
      >
        <Form {...layout} >
          <FormItem label="Pkg Name">
            {
              type !== 'add' ? <p>{targetConfig.pkg_name}</p>
                : this.typeIsAdd ? [getFieldDecorator('pkg_name', {
                  rules: [
                    {
                      required: true, message: "Required"
                    }
                  ]
                })(<Input className={styles.minInput} key='input' />), <Icon onClick={this.toggleAddType} className={styles.workBtn} key="iconxia" type='iconxia' />]

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
                        className={styles.minInput}
                        key='select'>
                        {this.props.allConfig.map(c => (
                          <Select.Option value={c} key={c}>
                            {c}
                          </Select.Option>
                        ))}
                      </Select>
                    ), <Icon className={styles.workBtn} onClick={this.toggleAddType} key='iconxinzeng1' type='iconxinzeng1' />
                  ]
            }
          </FormItem>
          <FormItem label="Platform">
            {
              type !== 'add' ? <p>{targetConfig.platform}</p>
                : getFieldDecorator('platform', {
                  rules: [
                    {
                      required: true, message: "Required"
                    }
                  ]
                })(
                  <Select
                    allowClear
                    showSearch
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
                >
                  {(targetConfig.versionArr || []).map(c => (
                    <Select.Option key={c.id} value={c.id}>
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
                <Input />
              )

            }
          </FormItem>
          {
            type === 'copy' ? <FormItem label="New Config Version">
              {getFieldDecorator('copyTo', {
                rules: [
                  {
                    required: true, message: "Required"
                  }
                ]
              })(
                <Input />
              )}
            </FormItem> : null
          }
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IProps>()(ConfigModel)
