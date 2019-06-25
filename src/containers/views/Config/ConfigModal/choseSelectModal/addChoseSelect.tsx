import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Button, Modal, Input, Select, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
const FormItem = Form.Item
const RadioGroup = Radio.Group;


const formItemLayout = {
  // labelCol: {
  //   xs: { span: 24 },
  //   sm: { span: 6 },
  //   lg: { span: 6 }
  // },
  // wrapperCol: {
  //   xs: { span: 24 },
  //   sm: { span: 18 },
  //   lg: { span: 18 }
  // }
}

let id = 0;


interface IStoreProps {
  fullTemplateAll?: () => Promise<any>
  allTemplateInfo?: ICustomStore.ICustomTree[]
}
interface IProps extends IStoreProps {
  visible: boolean
  onCancel: () => void
  onOK?: (data?) => void
}
@inject(
  (store: IStore): IStoreProps => {
    const { configStore } = store
    const { fullTemplateAll, allTemplateInfo } = configStore
    return { fullTemplateAll, allTemplateInfo }
  }
)

@observer
class TemplateModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private showErrMsg: boolean = false


  @observable
  private typeIsAdd: boolean = false

  @observable
  private template_pid: number

  @action
  setPid = (pid) => {
    this.template_pid = pid
  }

  @computed
  get templateTargetChidrenSet() {
    let arr = this.props.allTemplateInfo.find(ele => ele.id === this.template_pid).children || []
    return new Set(arr.map(ele => ele.template_name))
  }

  @computed
  get primaryNameSet() {
    return new Set(this.props.allTemplateInfo.map(ele => ele.primary_name))
  }


  @action
  toggleMsgShow = (type?) => {
    this.showErrMsg = type === undefined ? !this.showErrMsg : type
  }

  @action
  toggleLoading = (type?) => {
    this.loading = type || !this.loading
  }

  @action
  toggleAddType = () => {
    this.typeIsAdd = !this.typeIsAdd
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          if (values.checked === undefined || !values.keys.includes(values.checked)) {
            this.toggleMsgShow()
          } else {
            this.toggleMsgShow(false)
            this.toggleLoading()
            const {
              pId,
              keys,
              names,
              pName,
              checked
            } = values;
            const index = keys.findIndex(ele => ele === checked)
            const optionArr = keys.map(e => names[e])
            if (optionArr.length !== [...new Set(optionArr)].length) {
              this.$message.error('Please check if you have duplicated the contents you have filled in')
            } else {
              const value = optionArr[index]
              let per = {}

              if (pName) {
                per = {
                  value,
                  unit: 2,
                  template: pName,
                  option: optionArr.join(','),
                }
              } else {
                per = {
                  value,
                  unit: 1,
                  pid: pId,
                  option: optionArr.join(','),
                }
              }
              this.props.onOK(per)
              this.onCancel()
            }
            this.toggleLoading(false)
          }

        }
      }
    )
  }

  onCancel = () => {
    this.props.onCancel()
    this.props.form.resetFields()
    this.add()
  }

  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  componentDidMount() {
    this.add()
  }




  render() {
    const { form, visible, allTemplateInfo } = this.props
    const { getFieldDecorator, getFieldValue } = form;
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <Form.Item

        required={false}
        key={k.toString()}
      >
        {getFieldDecorator(`names[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please input template Name or delete this field.",
          },
          {
            validator: (r, v, callback) => {
              if (!this.typeIsAdd && this.templateTargetChidrenSet.has(v)) {
                callback('Template already exists')
              }
              callback()
            }
          }
          ],
        })(
          <Input autoComplete="off" placeholder="Template Name" style={{ width: '60%', marginRight: 8 }} />
        )}
        <Icon
          className={styles.dynamic}
          type="iconjianshao"
          onClick={() => this.remove(k)}
        />
        <Icon
          className={styles.dynamic}
          type="icontianjia"
          onClick={() => this.add()}
        />

      </Form.Item>
    ));

    const radioGroup = (
      <FormItem>
        {
          getFieldDecorator('checked')(
            <RadioGroup>
              {
                keys.map(k => (
                  <Radio className={styles.radio} key={k.toString()} value={k} />
                ))
              }
            </RadioGroup>
          )
        }
      </FormItem>
    )


    return (
      <Modal
        title='Add Template'
        visible={visible}
        destroyOnClose={true}
        onOk={this.submit}
        onCancel={this.onCancel}
        footer={[
          <Button key='cancel' loading={this.loading} onClick={this.onCancel} >Cancel</Button>,
          <Button key='submit' type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
        ]}
      >
        <Form {...formItemLayout}>
          <FormItem>
            {this.typeIsAdd ? [getFieldDecorator('pName', {
              rules: [
                {
                  required: true, message: "Required"
                },
                {
                  validator: (r, v, callback) => {
                    if (this.primaryNameSet.has(v)) {
                      callback('Template already exists')
                    }
                    callback()
                  }
                }
              ]
            })(<Input autoComplete="off" className={styles.minInput} key='input' />), <Icon onClick={this.toggleAddType} className={styles.workBtn} key="iconxia" type='iconxia' />]

              : [
                getFieldDecorator('pId', {
                  rules: [
                    {
                      required: true, message: "Required"
                    }
                  ]
                })(
                  <Select
                    allowClear
                    showSearch
                    onChange={(val) => this.setPid(val)}
                    getPopupContainer={trigger => trigger.parentElement}
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    className={styles.minInput}
                    key='select'
                  >
                    {allTemplateInfo.map(c => (
                      <Select.Option value={c.id} key={c.id}>
                        {c.primary_name}
                      </Select.Option>
                    ))}
                  </Select>
                ), <Icon className={styles.workBtn} onClick={this.toggleAddType} key='iconxinzeng1' type='iconxinzeng1' />
              ]
            }
          </FormItem>
          <div className={styles.box}>
            <div className={styles.redio}>

              {radioGroup}
            </div>
            <div className={styles.inputBox}>
              {formItems}
            </div>
          </div>
          {this.showErrMsg ? <p className={styles.errmsg}>One must be chosen.</p> : null}
          <p className={styles.help}>
            *添加完成后，请去模版管理页面完善信息，否则config 中将不升效！
          </p>
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IProps>()(TemplateModal)
