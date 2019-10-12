import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Select, Button, message, Row, Col, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { pidTypes } from '../config'
import { match } from 'react-router'


const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
    lg: { span: 5 },
    xl: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
    lg: { span: 8 },
    xl: { span: 6 }
  }
}


interface IProps {
  item?: ICreativeFrequencyStore.IitemForList
  getPkgNameList?: () => void
  setItem?: (item: ICreativeFrequencyStore.IitemForList) => void
  getCreativeList?: () => void
  optionListDb?: ICreativeFrequencyStore.OptionListDb
  routerStore?: RouterStore
  match?: match<{
    id: string
  }>
}

@inject(
  (store: IStore): IProps => {
    const { creativeFrequencyStore, routerStore } = store
    const { item, optionListDb, getCreativeList, getPkgNameList, setItem } = creativeFrequencyStore
    return { routerStore, item, optionListDb, getCreativeList, getPkgNameList, setItem }
  }
)
@observer
class CreativeFrequencyModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  // frequecy中是否有小数点
  @observable
  private hasDecimal: boolean = false

  @observable
  private creativeOptionDis: boolean = true;

  @observable
  private isEdit: boolean = false

  constructor(props) {
    super(props)
    if (this.props.match.params.id) {
      if (!this.props.item.id) {
        this.props.routerStore.replace('/creativeFrequency');
      } else {
        this.isEdit = true;
      }
    }
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  checkDecimal = (el, e: any) => {
    if (!e.target.value) return;
    e.persist()
    this.hasDecimal = e.target.value.indexOf('.') > -1 || (+e.target.value) <= 0
    if (!this.props.form.getFieldValue(el)) {
      this.props.form.resetFields([el])
    }
    // setImmediate(() => {
    //   this.props.form.resetFields
    //   // this.props.form.validateFields([el]);
    // })
  }

  @action
  setNumber = (el, e) => {
    let res = this.props.form.getFieldValue(el);
    if (res === undefined) return;
    res = +res;
    this.props.form.setFieldsValue({
      [el]: res <= 0 ? '' : res.toFixed()
    })
    this.hasDecimal = false
  }

  @action
  creativeChanged = (value) => {
    if (value.includes(0)) {
      this.creativeOptionDis = true;
      setImmediate(() => {
        this.props.form.setFieldsValue({
          creative_id: [0]
        })
      });
    } else {
      this.creativeOptionDis = false;
    }
  }

  componentWillUnmount() {
    this.props.setItem({});
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { routerStore, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            let data = { message: '' }
            if (this.isEdit) {
              data = await this.api.creativeFrequency.edit({
                id: this.props.match.params.id,
                ...values
              })
            } else {
              if (values.creative_id.includes(0)) {
                values.creative_id = []
              }
              data = await this.api.creativeFrequency.create(values)
            }

            message.success(data.message)
            routerStore.push('/creativeFrequency')
          } catch (err) {
            console.error(err);
          }
          this.toggleLoading()
        }
      }
    )
  }

  componentDidMount() {
    if (this.isEdit === false) {
      this.props.getCreativeList();
      this.props.getPkgNameList();
    }
  }

  render() {
    const { item, form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <div className='sb-form'>
        <Form className={styles.taskModal} >
          <FormItem {...formItemLayout} label="Pkg Name">
            {this.isEdit ?
              <span>{item.pkg_name}</span>
              : getFieldDecorator('dev_id', {
                initialValue: item.dev_id,
                rules: [{ required: true, message: "Required" }]
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.pkgnames.map(c => {
                    return <Select.Option key={c.dev_id} value={c.dev_id}>
                      {c.pkg_name}
                    </Select.Option>
                  })}
                </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="PID Type">
            {this.isEdit ?
              <span>{pidTypes.find(v => v.value === item.pid_type).key}</span>
              : getFieldDecorator('pid_type', {
                initialValue: item.pid_type,
                rules: [{ required: true, message: "Required" }]
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {pidTypes.map(c => {
                    return <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  })}
                </Select>
              )}
          </FormItem>
          <FormItem {...formItemLayout} label="Creative">
            {this.isEdit ?
              <span>{item.creative_name || 'All'}</span>
              : getFieldDecorator('creative_id', {
                initialValue: item.creative_id || [0],
                rules: [{ required: true, message: "Required" }]
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  onChange={this.creativeChanged}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Select.Option key='null' value={0}>All</Select.Option>
                  {optionListDb.creatives.map(c => (
                    <Select.Option key={c.id} value={c.id} disabled={this.creativeOptionDis}>
                      {`${c.id}-${c.name}`}
                    </Select.Option>
                  ))}
                </Select>
              )}
          </FormItem>
          <Row>
            <Col {...formItemLayout.labelCol} className="ant-form-item-label">
              <label className="ant-form-item-required">Frequency</label>
            </Col>
            <Col {...formItemLayout.wrapperCol} className={styles.frequency + ' ant-form-inline'}>
              <FormItem>
                {getFieldDecorator('limit_num', {
                  initialValue: item.limit_num,
                  rules: [{ required: true, message: "Required" }]
                })(
                  <Input onChange={e => this.checkDecimal('limit_time', e)} onBlur={e => this.setNumber('limit_num', e)} />
                )}
              </FormItem>
              <span> time(s) /　</span>
              <FormItem>
                {getFieldDecorator('limit_time', {
                  initialValue: item.limit_time,
                  rules: [{ required: true, message: "Required" }]
                })(
                  <Input onChange={e => this.checkDecimal('limit_num', e)} onBlur={e => this.setNumber('limit_time', e)} />
                )}
              </FormItem>
              <span> day(s)</span>
              {this.hasDecimal && <div className='ant-form-explain'>time(s)/day(s) should be a positive integer.</div>}
            </Col>
          </Row>

          <FormItem className={styles.btnBox}>
            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
            <Button style={{ marginLeft: 20 }} onClick={() => this.props.routerStore.push('/creativeFrequency')}>Cancel</Button>
          </FormItem>
        </Form>
      </div >
    )
  }
}

export default Form.create<IProps>()(CreativeFrequencyModal)
