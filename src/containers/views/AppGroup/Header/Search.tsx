import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { platformOption, statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

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
  changeFilter?: (params: IAppGroupStore.SearchParams) => void
  getUserList?: () => Promise<any>
  getAccount?: () => Promise<any>
  filters?: IAppGroupStore.SearchParams
  userOption?: IAppGroupStore.UserOption
  optionListDb?: IAppGroupStore.OptionListDb
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter, filters, getUserList, userOption, optionListDb, getAccount } = store.appGroupStore
    return { changeFilter, filters, getUserList, userOption, optionListDb, getAccount }
  }
)
@observer
class AppGroupSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
  componentWillMount() {
    this.props.getUserList()
    this.props.getAccount()
  }

  render() {
    const { form, filters, optionListDb, userOption } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="App Name" className={styles.searchInput}>
              {getFieldDecorator('app_name', {
                initialValue: filters.app_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Pkg Name" className={styles.searchInput}>
              {getFieldDecorator('pkg_name', {
                initialValue: filters.pkg_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Platform" className='minInput'>
              {getFieldDecorator('platform')(
                <Select
                  allowClear
                  mode='multiple'
                  showSearch
                  getPopupContainer={trigger => trigger.parentElement}
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
            <FormItem label="SEN Account">
              {getFieldDecorator('sen_account', {
                initialValue: filters.sen_account,
                // rules: [
                //   {
                //     required: true, message: "Required"
                //   }
                // ]
              })(
                <Select
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.Account.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="BD">
              {getFieldDecorator('BD', {
                initialValue: filters.BD,
                // rules: [
                //   {
                //     required: true, message: "Required"
                //   }
                // ]
              })(
                <Select
                  showSearch
                  mode='multiple'
                  allowClear
                  maxTagCount={1}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {userOption.BD.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="AM">
              {getFieldDecorator('AM', {
                initialValue: filters.AM,
                // rules: [
                //   {
                //     required: true, message: "Required"
                //   }
                // ]
              })(
                <Select
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  allowClear
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {userOption.AM.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
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
                  maxTagCount={1}
                  mode='multiple'
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
            <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='appGroupAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(AppGroupSearch)
