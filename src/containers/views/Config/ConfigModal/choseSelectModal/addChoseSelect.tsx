import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Button, Modal, Input, Select, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import { defaultOption } from "@views/Custom/default.config";
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
  fullTemplate?: () => Promise<any>
  getSidebar?: () => Promise<any>
  tmpSidebar?: IAuthStore.Sidebar[]
  getTemplateSelect?: (pid: number, useCache?: boolean) => Promise<any>
}
interface IProps extends IStoreProps {
  visible: boolean
  onCancel: () => void
  onOK?: (data?) => void
}
@inject(
  (store: IStore): IStoreProps => {
    const { customStore, authStore, templateStore } = store
    const { getSidebar, tmpSidebar } = authStore
    const { fullTemplate } = customStore
    const { getTemplateSelect } = templateStore
    return { getTemplateSelect, fullTemplate, getSidebar, tmpSidebar }
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

  @action
  toggleMsgShow = (type?) => {
    this.showErrMsg = type === undefined ? !this.showErrMsg : type
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
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
            let addId = pId;
            if (pName) {
              const res = await this.api.custom.createCustom({ primary_name: pName, config: defaultOption })
              addId = res.data.id
              this.props.getSidebar()
            }
            const data = await this.api.template.batchAddTemplateDetail({ id: addId, template_name: keys.map(e => names[e]) })
            const index = keys.findIndex(ele => ele === checked)
            this.props.fullTemplate()
            this.props.getTemplateSelect(addId, false)
            this.props.onOK({
              template_pid: addId,
              templateId: data[index]
            })
            this.onCancel()
            this.toggleLoading()
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
    const { form, visible, tmpSidebar } = this.props
    const { getFieldDecorator, getFieldValue } = form;
    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <Form.Item

        required={false}
        key={k}
      >
        {getFieldDecorator(`names[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please input emplate Name or delete this field.",
          }],
        })(
          <Input placeholder="Template Name" style={{ width: '60%', marginRight: 8 }} />
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
                  <Radio className={styles.radio} key={k} value={k} />
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
                }
              ]
            })(<Input className={styles.minInput} key='input' />), <Icon onClick={this.toggleAddType} className={styles.workBtn} key="iconxia" type='iconxia' />]

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
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    className={styles.minInput}
                    key='select'
                  >
                    {tmpSidebar.map(c => (
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
