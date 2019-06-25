import * as React from 'react'
import { observable, action, runInAction, computed } from 'mobx'
import { observer } from 'mobx-react'

import { Form, Input, Select, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import Basic from '../Basic'
import * as styles from './index.scss'
import { value_typeOption } from './valueType'
import { typeOf, _nameCase } from '@utils/index'
import { arrayToTree, queryArray } from '@utils/index'
import { conItem } from '../type'

const FormItem = Form.Item
const RadioGroup = Radio.Group;

interface IProps {
  data?: any[]
  addConfigGroup?: any
  onSubmit?: (data) => void
  onCancel?: () => void
  pidList?: string[]
}



@observer
class FormPid extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false



  @observable
  private pid_type: number


  @computed
  get propData() {
    const tar = JSON.parse(JSON.stringify(this.props.data))
    // Object.keys(tar).forEach(key => {
    //   if (typeOf(tar[key]) === 'object') {
    //     delete tar[key].value_type
    //   }
    // })
    return tar
  }

  @computed
  get usePid_type() {
    return this.pid_type || this.usEeditData['pid_type'] || 3
  }

  @computed
  get addList() {
    const name = value_typeOption.find(ele => ele.value === this.usePid_type).phpKey
    let arr = (this.props.addConfigGroup[name] || []).filter(ele => {
      return ele.key !== 'pid_type' && ele.key !== 'placement_id' && ele.key !== 'PID_status'
    })
    const toTree = (list) => list ? arrayToTree<conItem>(list, 'id', 'pid') : []
    let mmArr = toTree(arr);
    const dataKeyarr = this.usEeditData && typeOf(this.usEeditData) === 'object' ? Object.keys(this.usEeditData) : []
    if (dataKeyarr.length) {
      mmArr = dataKeyarr.map(key =>
        mmArr.find(ele => _nameCase(ele.key) === _nameCase(key)) || (typeOf(this.usEeditData[key]) === 'object' ? this.usEeditData[key] : null)
      ).filter(ele => !!ele)
    }
    console.log(mmArr)
    return mmArr
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
    const { onSubmit, form, pidList } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (this.isAdd && pidList.includes(values.placement_id)) {
          this.$message.error('Add failure!PID is already exist! ')
          return
        }
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

  getValue = (key) => {
    return this.usEeditData[key]
  }




  render() {
    const { form, data } = this.props

    const { getFieldDecorator } = form
    return (
      <div className={styles.formPid}>
        <FormItem className={styles.minitem} label='PID Status'>
          {getFieldDecorator('pid_status', {
            initialValue: this.getValue('PID_status') === undefined ? 1 : this.getValue('PID_status'),
            rules: [
              {
                required: true, message: "Required"
              }
            ]
          })(<RadioGroup>
            <Radio value={0}>OFF</Radio>
            <Radio value={1}>ON</Radio>
          </RadioGroup>)}

        </FormItem>
        <FormItem className={styles.minitem} label='PID Type'>
          {getFieldDecorator('pid_type', {
            initialValue: this.getValue('pid_type') || this.usePid_type,
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

        <FormItem className={styles.minitem} label='PID'>
          {getFieldDecorator('placement_id', {
            initialValue: this.getValue('placement_id'),
            rules: [
              {
                required: true, message: "Required"
              }
            ]
          })(<Input autoComplete="off" disabled={!this.isAdd} />)}
        </FormItem>
        <Basic
          onCancel={this.props.onCancel}
          onSubmit={this.submit}
          editData={this.propData}
          addList={this.addList}
        />
        {/* <Button className={styles.cancelBtn} onClick={() => this.props.onCancel()} >Cancel</Button> */}
      </div>
    )
  }
}

export default Form.create<IProps>()(FormPid)
