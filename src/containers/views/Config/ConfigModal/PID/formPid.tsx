import * as React from 'react'
import { observable, action, runInAction, computed } from 'mobx'
import { inject, observer } from 'mobx-react'

import { Form, Input, Select, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import Basic from '../Basic'
import * as styles from './index.scss'
import { value_typeOption } from './valueType'
import { typeOf } from '@utils/index'
const FormItem = Form.Item

const span = 2
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18
  }
}

interface IStoreProps {
  targetConfig?: IConfigStore.IConfigTarget
}
interface IProps extends IStoreProps {
  data?: any[]
  onSubmit?: (data) => void
  onCancel?: () => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { configStore } = store
    const { targetConfig } = configStore
    return { targetConfig }
  }
)

@observer
class FormPid extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private addConfigGroup = {}

  @observable
  private pid_type: number = 1

  @computed
  get addList() {
    const name = value_typeOption.find(ele => ele.value === this.pid_type).phpKey
    return (this.addConfigGroup[name] || []).filter(ele => {
      return ele.key !== 'pid_type' && ele.key !== 'placement_id'
    })
  }
  @computed
  get usEeditData() {
    if (typeOf(this.props.data) === 'array') {
      let target = {}
      this.props.data.forEach(ele => {
        target = { ...target, ...ele }
      })
      return target
    } else {
      return this.props.data
    }
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  @computed
  get isAdd() {
    return !this.getValue('placement_id')
  }

  submit = (data): void => {
    const { onSubmit, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            const pre = Object.entries(values).map(([key, value]) => ({ [key]: value })).concat(data)
            onSubmit(pre)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  @action
  typeChange = (value: number) => {
    this.pid_type = value
  }

  initDetail = async () => {
    const Detail = await this.api.config.pidFieldInfo({ platform: (this.props.targetConfig || {}).platform || 'android' })
    runInAction('Change_', () => {
      this.addConfigGroup = Detail.data
    })
  }

  getValue = (key) => {
    return this.usEeditData[key]
  }

  componentWillMount() {
    this.initDetail()
  }


  render() {
    const { form, data } = this.props

    const { getFieldDecorator } = form
    return (
      <div className={styles.formPid}>
        <FormItem {...layout} label='PID Type'>
          {getFieldDecorator('pid_type', {
            initialValue: this.getValue('pid_type') || this.pid_type,
            rules: [
              {
                required: true
              }
            ]
          })(
            <Select
              allowClear
              showSearch
              onChange={this.typeChange}
              disabled={!this.isAdd}
              placeholder='value type'
            >
              {value_typeOption.map(c => (
                <Select.Option key={c.key} value={c.value}>
                  {c.key}
                </Select.Option>
              ))}
            </Select>
          )}
        </FormItem>

        <FormItem {...layout} label='PID'>
          {getFieldDecorator('placement_id', {
            initialValue: this.getValue('placement_id'),
            rules: [
              {
                required: true
              }
            ]
          })(<Input placeholder='name' disabled={!this.isAdd} />)}
        </FormItem>
        <Basic
          onCancel={this.props.onCancel}
          onSubmit={this.submit}
          editData={this.props.data}
          addList={this.addList}
        />
        {/* <Button className={styles.cancelBtn} onClick={() => this.props.onCancel()} >Cancel</Button> */}
      </div>
    )
  }
}

export default Form.create<IProps>()(FormPid)