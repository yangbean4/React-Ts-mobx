import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, computed, runInAction, when } from 'mobx'
import { Form, Button, Modal, Input, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
const FormItem = Form.Item
const RadioGroup = Radio.Group;


let id = 0;

interface IProps {
  visible: boolean
  onCancel: () => void
  onOK?: (data?) => void
  option?: string
  type: number
}

@observer
class EditRedioModal extends ComponentExt<IProps & FormComponentProps> {

  constructor(props) {
    super(props)
    when(
      // 一旦...
      () => {
        return !!this.props.visible
      },
      // ... 然后
      () => this.setDefault()
    );
  }


  @observable
  private loading: boolean = false

  @observable
  private showErrMsg: boolean = false

  private optionTarget = []

  @computed
  get title() {
    return this.props.type === 1 ? 'setting Radio' : 'setting Option'
  }

  setDefault = () => {
    const initialValueObj = []
    let arr = [];
    if (this.props.type === 1) {
      const optionArr = this.props.option.split(',')
      arr = optionArr.map(ele => {
        const k = id++
        initialValueObj[k] = ele
        return k
      })
    } else {
      const optionArr = JSON.parse(this.props.option || '[{"label":"","value":""}]')
      arr = optionArr.map(ele => {
        const k = id++
        initialValueObj[k] = ele.label
        this.optionTarget[k] = ele.value
        return k
      })
    }


    const { form } = this.props;
    setImmediate(() => {
      form.setFieldsValue({
        keys: arr,
      });
      form.setFieldsValue({
        names: initialValueObj,
      });
    })
  }


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
              keys, names, checked
            } = values
            if (this.props.type === 1) {
              this.props.onOK({
                option: keys.map(e => names[e]).join(','),
                default: keys.findIndex(e => e === checked)
              })
            } else {
              const arr = keys.map(e => {
                return {
                  label: names[e],
                  value: this.optionTarget[e] || names[e]
                }
              })
              this.props.onOK({
                option: JSON.stringify(arr),
                default: this.optionTarget[checked] || names[checked]
              })
            }

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



  render() {
    const { form, visible, option = '' } = this.props
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
            message: "Please input Radio Name or delete this field.",
          }],
        })(
          <Input autoComplete="off" placeholder="Radio Name" style={{ width: '60%', marginRight: 8 }} />
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
        title={this.title}
        visible={visible}
        onOk={this.submit}
        onCancel={this.onCancel}
        footer={[
          <Button key='cancel' loading={this.loading} onClick={this.onCancel} >Cancel</Button>,
          <Button key='submit' type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
        ]}
      >
        <Form>
          <div className={styles.box}>
            <div className={styles.redio}>

              {radioGroup}
            </div>
            <div className={styles.inputBox}>
              {formItems}
            </div>
          </div>
          {this.showErrMsg ? <p className={styles.errmsg}>One must be chosen.</p> : null}
        </Form>
      </Modal>
    )
  }
}

export default Form.create<IProps>()(EditRedioModal)
