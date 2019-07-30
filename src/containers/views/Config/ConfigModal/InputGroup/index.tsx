import * as React from 'react'
import { Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'




interface IProps {
  value?: string[]
  onChange?: (data) => void
}

class InputGroup extends ComponentExt<IProps & FormComponentProps> {


  private id = 0;



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
    const nextKeys = keys.concat(this.id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  onChange = (e, index) => {
    let value = e.target.value;
    const arr = JSON.parse(JSON.stringify(this.props.value))
    arr[index] = value
    this.props.onChange(arr)
  }

  setDefault = () => {
    const initialValueObj = []
    let arr = [];

    const { form, value } = this.props;
    arr = value.map(ele => {
      const k = this.id++
      initialValueObj[k] = ele
      return k
    })
    setImmediate(() => {
      form.setFieldsValue({
        keys: arr,
      });
      form.setFieldsValue({
        names: initialValueObj,
      });
    })
  }

  componentWillMount() {
    this.setDefault()
  }

  render() {
    const { form } = this.props
    const { getFieldDecorator, getFieldValue } = form;


    getFieldDecorator('keys', { initialValue: [] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <div
        key={k.toString()}
      >
        {getFieldDecorator(`names[${k}]`, {
          initialValue: this.props.value[k],
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please input or delete this field.",
          }],
        })(
          <Input autoComplete="off" className={styles.input} onChange={(e) => this.onChange(e, k)} style={{ width: '60%', marginRight: 8 }} />
        )}
        {/* <Input autoComplete="off"  /> */}
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
      </div>
    ));


    return (
      <div className={styles.inputBox}>
        {formItems}
      </div>
    )
  }
}

export default Form.create<IProps>()(InputGroup)
