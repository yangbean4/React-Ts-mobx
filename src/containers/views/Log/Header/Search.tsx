import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment';
import { ComponentExt } from '@utils/reactExt'

const dateFormat = 'YYYY-MM-DD'
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker
const span = 6
const layout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19
  }
}
const userCategory = [{
  value: 1,
  title: 'Add'
}, {
  value: 2,
  title: 'Edit'
}, {
  value: 3,
  title: 'Delete'
}]

interface IStoreProps {
  changeFilter?: (params: ILogsStore.SearchParams) => void
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter } = store.logsStore
    return { changeFilter }
  }
)
@observer
class UserSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false



  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  defaultValue = () => {
    return [].map(val => moment(val, dateFormat))
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
            if (Array.isArray(values.datetime) && values.datetime[0] && values.datetime[1]) {
              values.datetime = values.datetime.map(ele => ele.format('YYYY-MM-DD')).join(' - ')
            } else {
              values.datetime = undefined
            }
            changeFilter(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  render() {
    const { form } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} onSubmit={this.submit}>
        <Row>
          <Col span={span}>
            <FormItem label="Operator">
              {getFieldDecorator('operator_name')(<Input />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Type">
              {getFieldDecorator('type')(
                <Select
                  allowClear
                  showSearch
                  getPopupContainer={trigger => trigger. parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {userCategory.map(c => (
                    <Select.Option key={c.title} value={c.value}>
                      {c.title}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Object">
              {getFieldDecorator('object')(<Input />)}
            </FormItem>
          </Col>

          <Col span={span}>
            <FormItem label="Operation">
              {getFieldDecorator('operation')(<Input />)}
            </FormItem>
          </Col>

          <Col span={span}>
            <FormItem label="Time">
              {getFieldDecorator('datetime', {
                initialValue: this.defaultValue()
              })(<RangePicker format={dateFormat} />)}
            </FormItem>
          </Col>

          <Col span={3} offset={1}>
            <Button type="primary" htmlType="submit">Search</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(UserSearch)
