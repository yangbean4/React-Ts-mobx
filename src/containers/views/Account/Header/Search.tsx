import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, autorun, runInAction } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import { camelCase } from '@utils/index'
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
  changeFilter?: (params: IAccountStore.SearchParams) => void
  filters?: IAccountStore.SearchParams
  routerStore?: RouterStore
  setAccountType?: (str: string) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { accountStore, routerStore } = store
    const { changeFilter, filters, setAccountType } = accountStore
    return { changeFilter, filters, routerStore, setAccountType }
  }
)
@observer
class AccountSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private accountType: string = ''

  private IReactionDisposer: () => void

  constructor(props) {
    super(props)
    this.IReactionDisposer = autorun(
      () => {
        const accountType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        if (accountType !== this.accountType) {
          runInAction('SET_TYPE', () => {
            this.accountType = accountType
          })
          this.props.form.resetFields()
          this.props.setAccountType(accountType)
          return true
        }
        return false
      }
    )
  }

  @computed
  get typeName() {
    return `${camelCase(this.accountType)} Company`
  }


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
  componentDidMount() {
    this.IReactionDisposer()
  }

  render() {
    const { form, filters } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label={this.typeName}>
              {getFieldDecorator('company_name', {
                initialValue: filters.company_name
              })(<Input autoComplete="off" />)}
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
            <Button type="primary" onClick={this.submit}>Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='accountAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(AccountSearch)
