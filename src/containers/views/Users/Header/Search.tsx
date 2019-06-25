import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'

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
  changeFilter?: (params: IUserStore.SearchParams) => void
  filters?: IUserStore.SearchParams
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter, filters } = store.userStore
    return { changeFilter, filters }
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
            changeFilter(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  render() {
    const { form, filters } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="User Name">
              {getFieldDecorator('user_name', {
                initialValue: filters.user_name
              })(<Input autoComplete="off" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Owner" className='minInput'>
              {getFieldDecorator('owner', {
                initialValue: filters.owner
              })(<Input autoComplete="off" autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Status" className='minInput'>
              {getFieldDecorator('status', {
                initialValue: filters.status
              })(
                <Select
                  allowClear
                  showSearch
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {statusOption.map(c => (
                    <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" onClick={this.submit}>Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='customAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(UserSearch)
