import * as React from 'react'
import { observer } from 'mobx-react'
import { observable, action, runInAction, when, autorun } from 'mobx'
import { Form, Input, Row, Col, Button, Select, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { value_typeOption } from '../as.config'
import { conItem } from './type'
import { SketchPicker } from 'react-color'
import InputGroup from './InputGroup/index'
import { _nameCase, typeOf } from '@utils/index'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const span = 3
const layout = {
  labelCol: {
    span: 1,
  },
  wrapperCol: {
    span: 22
  }
}
interface IProps {
  config?: conItem
  onOk?: (con?: conItem) => void
  choseSelect?: (con: conItem) => void
  editRadio?: (con: conItem) => void
  shouldSubmit?: boolean
}

@observer
class AddConfigItem extends ComponentExt<IProps & FormComponentProps> {

  constructor(props) {
    super(props)
    when(
      // 一旦...
      () => {
        // 父组件要提交
        return !!this.props.shouldSubmit
      },
      // ... 然后
      () => this.submit()
    );
  }

  @observable
  private loading: boolean = false

  @observable
  private valueType: string

  @observable
  private pickerVisible: boolean = true


  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  @action
  onTogglePicker = () => {
    this.pickerVisible = !this.pickerVisible
  }

  handleColorChange = (data) => {
    this.onTogglePicker()
    this.props.form.setFieldsValue({
      default: data.hex
    })
  }

  InputGroupChange = (value) => {
    this.props.form.setFieldsValue({
      default: value
    })
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { onOk, form, config } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        let data = undefined
        if (!err) {
          this.toggleLoading()
          try {
            const dd = values.value_type === '4' ? values.default.filter(ele => !!ele) : values.default
            data = { ...config, ...values, default: dd }
          } catch (err) {
            console.log(err)
          }
          this.toggleLoading()
        }
        onOk(data)
      }
    )
  }

  @action
  typeChange = (value: string) => {
    runInAction('CHANGE_VALUE_TYPE', () => {
      this.valueType = value
    })
    this.props.form.setFieldsValue({
      default: undefined
    })
  }

  editRadio = () => {
    this.props.editRadio(this.props.config)
  }
  choseSelect = () => {
    this.props.choseSelect(this.props.config)
  }

  getChild = () => {
    const config = this.props.config
    const getFieldDecorator = this.props.form.getFieldDecorator
    const {
      option = ''
    } = config
    switch (this.valueType) {
      case '1':
        return [
          (<Col span={span} key='default'>
            <FormItem {...layout}>
              {getFieldDecorator('default', {
                initialValue: config.default
              })(<Input placeholder='default' />)}
            </FormItem>
          </Col>),
          (<Col span={span} key='unit'>
            <FormItem {...layout}>
              {getFieldDecorator('unit', {
                initialValue: config.unit
              })(<Input placeholder='unit' />)}
            </FormItem>
          </Col>)
        ]

      case '2':
        const value = this.props.form.getFieldValue('default');

        return (<Col span={4} key='default'>
          <FormItem {...layout}>
            <div>
              {getFieldDecorator('default', {
                initialValue: config.default
              })(<Input placeholder='default' onDoubleClick={() => this.onTogglePicker()} />)}
              {
                this.pickerVisible && (
                  <div style={{ position: 'absolute', zIndex: 10 }} key='color'>
                    <SketchPicker
                      color={{ hex: value }}
                      onChangeComplete={this.handleColorChange}
                    />
                  </div>
                )
              }
            </div>
          </FormItem>
        </Col>)

      case '4':
        let vv;
        if (Array.isArray(value)) {
          vv = value
        } else {
          try {
            vv = JSON.parse(value)
          } catch (error) {
            vv = [value || '']
          }
        }

        return (<Col span={6} key='default'>
          <FormItem {...layout}>

            {
              getFieldDecorator('default', {
                initialValue: vv,
              })(<InputGroup />)
              // value={vv} onChange={this.InputGroupChange}
            }
          </FormItem>
        </Col>)

      case '3'://select
        return (<Col span={7} key='default'>
          <FormItem {...layout} className='gouSelect'>
            <Button onDoubleClick={this.choseSelect} key='Button' type="dashed">edit Select</Button>
            {getFieldDecorator('default', {
              initialValue: config.default,
            })(<Select
              getPopupContainer={trigger => trigger. parentElement}
            >
              {
                JSON.parse(option || '[]').map((c, i) => (
                  <Select.Option key={c.label} value={c.value}>
                    {c.label}
                  </Select.Option>
                ))
              }
            </Select>
            )}
          </FormItem>
        </Col>)
      case '5'://radio
        let arr: { label: string, value: string | number }[] = option.split(',').filter(item => !!item).map((item, index) => {
          return {
            label: item,
            value: index,
          }
        })
        if (arr.length === 2 && (option.toLowerCase().includes('on') || option.toLowerCase().includes('yes'))) {
          arr = arr.map(item => {
            const { label } = item
            return {
              label: label,
              value: +(label.toLowerCase().includes('on') || label.toLowerCase().includes('yes')),
            }
          })
        }
        return (
          <div className='redioGroup'>
            <Button onDoubleClick={this.editRadio} key='Button' type="dashed">edit Radio</Button>
            <span key='RadioGroup' >
              {
                getFieldDecorator('default', {
                  initialValue: config.default
                })(<RadioGroup>
                  {
                    arr.map((c, i) => (
                      <Radio key={c.value + c.label} value={c.value}>
                        {c.label}
                      </Radio>
                    ))
                  }
                </RadioGroup>)
              }
            </span>
          </div>
        )
    }
  }

  render() {
    const { form, config } = this.props
    const {
      key,
      value_type
    } = config
    const { getFieldDecorator } = form



    return (
      <Row className='addConfigItem'>
        <Col span={span} offset={3}>
          <FormItem {...layout}>
            {getFieldDecorator('key', {
              initialValue: key,
              rules: [
                {
                  required: true, message: "Required"
                }
              ]
            })(<Input placeholder='name' />)}
          </FormItem>
        </Col>
        <Col span={span}>
          <FormItem {...layout}>
            {getFieldDecorator('value_type', {
              initialValue: typeOf(value_type) === 'number' ? value_type.toString() : value_type,
              rules: [
                {
                  required: true, message: "Required"
                }
              ]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger. parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                onChange={this.typeChange}
                placeholder='value type'
              >
                {value_typeOption.map(c => (
                  <Select.Option {...c}>
                    {c.key}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Col>
        {this.getChild()}
        <Col span={3} offset={1}>
          <Button type="primary" onClick={this.submit}>OK</Button>
        </Col>
      </Row>
    )
  }
}

export default Form.create<IProps>()(AddConfigItem)
