import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { observable, action, runInAction, when, autorun, computed } from 'mobx'
import { Form, Input, Row, Col, Button, Select, Radio, Divider, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { value_typeOption } from '../as.config'
import { conItemTreeItem } from './type'
// import { SketchPicker } from 'react-color'
import InputGroup from './InputGroup/index'
import { _nameCase, typeOf } from '@utils/index'
import InputColor from '@components/InputColor/index'

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

interface IStoreProps {
  TemplatesTarget?: any
  templateTree?: ICustomStore.ICustomTree[]
  getTemplateSelect?: (pid: number, useCache?: boolean) => Promise<any>
}

interface IProps extends IStoreProps {
  config?: conItemTreeItem
  children?: () => React.ReactNode
  onOk?: (con?: conItemTreeItem) => void
  choseSelect?: (con: conItemTreeItem) => void
  editRadio?: (con: conItemTreeItem) => void
  shouldSubmit?: boolean
  changeTemp?: (config?: conItemTreeItem) => void
  setType?: (string, data) => void
  valueTypeArr?: string[]
}

@inject(
  (store: IStore): IStoreProps => {
    const { templateStore, customStore } = store
    const { templateTree } = customStore

    const { getTemplateSelect, TemplatesTarget } = templateStore
    return { getTemplateSelect, TemplatesTarget, templateTree }
  }
)

@observer
class AddConfigItem extends ComponentExt<IProps & FormComponentProps> {

  @observable
  private loading: boolean = false

  @observable
  private valueType: string

  @observable
  private pickerVisible: boolean = true

  @computed
  get fmtValueType() {
    const value_type = this.props.config.value_type
    return typeOf(value_type) === 'number' ? value_type.toString() : value_type
  }

  @computed
  get value_typeOption() {
    const set = new Set(this.props.valueTypeArr)
    return value_typeOption.filter(ele => set.has(ele.key))
  }

  @computed
  get useValueType() {
    return this.valueType || this.fmtValueType
  }

  @computed
  get firstTmpArr() {
    return this.props.templateTree.reduce((a, b) => a.concat(b.children), []).filter(ele => !!ele)
  }

  @computed
  get useSelectPid() {
    if (this.props.config.default) {
      const target = this.firstTmpArr.find(ele => ele.id === this.props.config.default) || {}
      return target.pid || this.props.config.template_pid
    } else {
      return this.props.config.template_pid
    }
  }

  @computed
  get selectOptionList() {
    const arr = (this.props.TemplatesTarget[this.useSelectPid] || [])
    if (this.props.config.unit && this.props.config.option) {
      return arr.concat(this.props.config.option.split(',').map(ele => ({
        value: ele,
        label: ele,
      })))
    }
    return arr
  }

  constructor(props) {
    super(props)
    autorun(
      // 一旦...
      () => {
        // 父组件要提交
        const res = !!this.props.shouldSubmit
        //console.log(this.props.shouldSubmit)
        if (res) {
          this.submit()
        }
        return res
      }
    )
  }


  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  @action
  onTogglePicker = () => {
    this.pickerVisible = !this.pickerVisible
  }

  changeTemp = () => {
    this.props.changeTemp(this.props.config)
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
    //console.log('submit')
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
            const dd = values.value_type == '4' ? values.default.filter(ele => !!ele) : values.default

            data = { ...config, ...values, default: dd }
            data.key = data.key.trim().replace(' ', '_')
            if (Array.isArray(data.option) && data.value_type == '5') {
              data.option = data.option.join(',')
            }
          } catch (err) {
            //console.log(err)
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
      default: value === '4' ? [''] : undefined
    })
    this.props.setType(value, {
      key: this.props.form.getFieldValue('key')
    })
  }

  editRadio = () => {
    this.props.editRadio(this.props.config)
  }
  choseSelect = () => {
    this.props.choseSelect(this.props.config)
  }

  getChild = (config: conItemTreeItem) => {
    // const config = this.props.config
    const getFieldDecorator = this.props.form.getFieldDecorator
    const {
      option = ''
    } = config
    switch (this.useValueType) {
      case '1':
        return [
          (<Col span={span} key='default'>
            <FormItem {...layout}>
              {getFieldDecorator('default', {
                initialValue: config.default
              })(<Input autoComplete="off" placeholder='default' />)}
            </FormItem>
          </Col>),
          (<Col span={span} key='unit'>
            <FormItem {...layout}>
              {getFieldDecorator('unit', {
                initialValue: config.unit
              })(<Input autoComplete="off" placeholder='unit' />)}
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
              })(<InputColor />)}

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
                initialValue: vv || [''],
              })(<InputGroup />)
              // value={vv} onChange={this.InputGroupChange}
            }
          </FormItem>
        </Col>)

      case '3'://select
        return (<Col span={8} key='default'>
          <FormItem {...layout} className='gouSelect'>
            {/* <Button onDoubleClick={this.choseSelect} key='Button' type="dashed">edit Select</Button> */}
            {getFieldDecorator('default', {
              initialValue: config.default,
              rules: [
                {
                  required: true, message: "Required"
                }
              ]
            })(<Select
              dropdownRender={
                menu => (
                  <div>
                    {menu}
                    <Divider key='Divider' style={{ margin: '4px 0' }} />
                    <div key='more-box' onMouseDown={e => { e.preventDefault(); }}
                      onClick={() => this.choseSelect()} style={{ padding: '8px', cursor: 'pointer' }}>
                      <Icon type="plus" /> edit Select
                      </div>
                  </div>
                )
              }
              getPopupContainer={trigger => trigger.parentElement}
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
        // let arr: { label: string, value: string | number }[] = option.split(',').filter(item => !!item).map((item, index) => {
        //   return {
        //     label: item,
        //     value: index,
        //   }
        // })
        // if (arr.length === 2 && (option.toLowerCase().includes('on') || option.toLowerCase().includes('yes'))) {
        //   arr = arr.map(item => {
        //     const { label } = item
        //     return {
        //       label: label,
        //       value: +(label.toLowerCase().includes('on') || label.toLowerCase().includes('yes')),
        //     }
        //   })
        // }
        return (
          <div className='redioGroup'>
            {/* <Button onDoubleClick={this.editRadio} key='Button' type="dashed">edit Radio</Button> */}
            <span key='RadioGroup' >
              {
                getFieldDecorator('default', {
                  initialValue: config.default || 0
                })(<RadioGroup>
                  {
                    [0, 1].map((c, index) => (
                      <Radio key={c} value={c}>
                        {
                          getFieldDecorator(`option[${index}]`,
                            {
                              rules: [
                                {
                                  required: true, message: "Required"
                                }
                              ]
                            }
                          )(<Input autoComplete="off" />)
                        }
                      </Radio>
                    ))
                  }
                </RadioGroup>)
              }
            </span>
          </div>
        )
      case '7'://template
        return (<Col span={6} key='default'>
          <FormItem {...layout} className='gouSelect'>
            {getFieldDecorator('default', {
              initialValue: config.default,
              rules: [
                {
                  required: true, message: "Required"
                }
              ]
            })(<Select
              dropdownRender={
                menu => (
                  <div>
                    {menu}
                    <Divider key='Divider' style={{ margin: '4px 0' }} />
                    <div key='more-box' onMouseDown={e => { e.preventDefault(); }}
                      onClick={() => this.changeTemp()} style={{ padding: '8px', cursor: 'pointer' }}>
                      <Icon type="plus" /> Change TemplatesGroup
                      </div>
                  </div>
                )
              }
              getPopupContainer={trigger => trigger.parentElement}
            >
              {
                this.selectOptionList.map((c, i) => (
                  <Select.Option key={c.label + i} value={c.value}>
                    {c.label}
                  </Select.Option>
                ))
              }
            </Select>
            )}
          </FormItem>
        </Col >)
      // case '8': {
      //   return (
      //     <div className='addGroup' key='addGroup'>
      //       {(config.children || []).map((ele) => this.getBox(ele))}
      //     </div>
      //   )
      // }
    }
  }

  getBox = (config) => {
    const { form } = this.props
    const {
      key,
    } = config
    const { getFieldDecorator } = form
    return (
      <div className={this.props.children ? 'addItemHasChildren' : ''}>
        <Row className='addConfigItem' key={config.addId}>
          <Col span={span} offset={3}>
            <FormItem {...layout}>
              {getFieldDecorator('key', {
                initialValue: key,
                rules: [
                  {
                    required: true, message: "Required"
                  }
                ]
              })(<Input autoComplete="off" placeholder='name' />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem {...layout}>
              {getFieldDecorator('value_type', {
                initialValue: this.fmtValueType,
                rules: [
                  {
                    required: true, message: "Required"
                  }
                ]
              })(
                <Select
                  disabled={config.typeIsOnly8}
                  allowClear
                  showSearch
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onChange={this.typeChange}
                  placeholder='value type'
                >
                  {this.value_typeOption.map(c => (
                    <Select.Option value={c.value} key={c.value}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {this.getChild(config)}
          <Col span={3} offset={1}>
            <Button type="primary" disabled={this.props.config.children && this.props.config.children.some(ele => ele.isEdit)} onClick={this.submit}>OK</Button>
          </Col>
        </Row>
        {
          this.props.children ? <div className='additemGroup'>
            {this.props.children}
          </div> : null
        }
      </div>

    )
  }

  render() {
    return this.getBox(this.props.config)
  }
}

export default Form.create<IProps>()(AddConfigItem)
