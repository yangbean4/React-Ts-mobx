import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button, DatePicker, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { platformOption } from '@config/web'
import { creativeOption } from '../config';
import { ComponentExt } from '@utils/reactExt'

const { RangePicker } = DatePicker;

const FormItem = Form.Item

const span = 6
const layout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 17
  }
}


interface IStoreProps {
  getOptionListDb?: () => void
  changeFilter?: (params: ITopCreativeStore.SearchParams) => void
  filters?: ITopCreativeStore.SearchParams,
  optionListDb?: ITopCreativeStore.OptionListDb
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter, filters, getOptionListDb, optionListDb } = store.topCreativeStore
    return { changeFilter, filters, getOptionListDb, optionListDb }
  }
)
@observer
class TopCreativeSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { changeFilter, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            if (Array.isArray(values.data_start) && values.data_start[0] && values.data_start[1]) {
              values.data_start = values.data_start.map(ele => ele.format('YYYYMMDD')).join(' - ')
            } else {
              values.data_start = undefined
            }
            changeFilter(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  componentWillMount() {
    this.props.getOptionListDb();
  }

  render() {
    const { form, filters, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="Creative Type" className='minInput'>
              {getFieldDecorator('creative_type', {
                initialValue: filters.creative_type
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  // getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {creativeOption.map(c => (
                    <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Creative" className='minInput'>
              {getFieldDecorator('creative_id', {
                initialValue: filters.creative_id
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  // getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.props.content.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.Creative.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      <Popover
                        content={`${c.id}-${c.name}`}
                        overlayClassName="popover-overlay"
                        overlayStyle={{ maxWidth: 220 }}
                        placement="left">
                        {`${c.id}-${c.name}`}
                      </Popover>
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Endcard" className='minInput'>
              {getFieldDecorator('endcard_id', {
                initialValue: filters.endcard_id
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  maxTagCount={0}
                  // getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.Endcard.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {`${c.id}-${c.name}`}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="App ID">
              {getFieldDecorator('app_id', {
                initialValue: filters.app_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Platform" className='minInput'>
              {getFieldDecorator('platform', {
                initialValue: filters.platform
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  // getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {platformOption.map(c => (
                    <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Data Start" className='minInput'>
              {getFieldDecorator('data_start', {
                initialValue: filters.data_start
              })(
                <RangePicker placeholder={['', '']} />
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="IPM≥" className='minInput'>
              {getFieldDecorator('ipm', {
                initialValue: filters.ipm
              })(
                <Input suffix="%" type="number" />
              )}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
          </Col>
          {/* <Col span={3} offset={1}>
            <span id='creativeAddBtn'></span>
          </Col> */}
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(TopCreativeSearch)
