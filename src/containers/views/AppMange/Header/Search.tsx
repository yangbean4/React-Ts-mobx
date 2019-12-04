import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, autorun, runInAction } from 'mobx'
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
  changeFilter?: (params: IAppManageStore.SearchParams, n?: number) => void
  filters?: IAppManageStore.SearchParams,
  routerStore?: RouterStore
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    const { changeFilter, filters } = store.appManageStore
    return { changeFilter, filters, routerStore }
  }
)
@observer
class CurrencySearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  private IReactionDisposer: () => void

  @observable
  private categoryOption: any[] = [];

  @observable
  private accountList: any[] = [];

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  constructor(props) {
    super(props)
    this.IReactionDisposer = autorun(
      () => {
        this.props.routerStore.history.listen(route => {
          this.props.form.resetFields()
        })
      }
    )
  }

  getCategory = async () => {
    const res = await this.api.appGroup.getCategory();
    console.log(res.data);
    runInAction('SET_CATEGORY', () => {
      this.categoryOption = res.data;
    })
  }

  getAccountList = async () => {
    const res = await this.api.appGroup.getAccountSource();
    runInAction('SET_ACCOUNT', () => {
      this.accountList = res.data;
    })
  }

  componentWillMount() {
    this.getCategory();
    this.getAccountList();
  }
  componentDidMount() {
    this.IReactionDisposer()
  }
  componentWillUnmount() {
    const { changeFilter, form } = this.props
    changeFilter({});
  }
  submit = (e?: React.FormEvent<any>, n?: number): void => {
    if (e) {
      e.preventDefault()
    }
    const { changeFilter, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            n ?
              changeFilter({ ...values, export: 1 }, 1) ://导出功能多加一个参数1
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
            <FormItem label="App ID" className={styles.searchInput}>
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
            <FormItem label="Category" className='minInput'>
              {getFieldDecorator('category_id', {
                initialValue: filters.category_id
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {this.categoryOption.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="SEN Account" className='minInput'>
              {getFieldDecorator('account_name', {
                initialValue: filters.account_name
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {this.accountList.map(c => (
                    <Select.Option key={c.id} value={c.name}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Status">
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
            <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" onClick={(e) => this.submit(e, 1)}>Export
            </Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='currencyAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(CurrencySearch)
