import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, autorun } from 'mobx'
import { Form, Input, Row, Col, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { platformOption, statusOption, adTypeOption } from '../web.config'

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
  changeFilter?: (params: ICampaignStore.SearchParams) => void
  filters?: ICampaignStore.SearchParams
  routerStore?: RouterStore
  getTargetCode?: () => Promise<any>
  setCampaignType?: (str: string) => void
  optionListDb?: ICampaignStore.OptionListDb
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, campaignStore } = store
    const { changeFilter, filters, setCampaignType, getTargetCode, optionListDb } = campaignStore
    return { changeFilter, filters, routerStore, setCampaignType, getTargetCode, optionListDb }
  }
)
@observer
class CampaignsSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private companyType: string = ''


  @observable
  private Account: ({ name?: string, id?: number })[] = []

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  getSourceAccount = async () => {
    const res = await this.api.appGroup.getAccountSource()
    runInAction('SET_SOURCE', () => {
      this.Account = res.data;
    })
  }
  componentWillMount() {
    this.getSourceAccount()
    this.props.getTargetCode()
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
    const { form, filters, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="App ID">
              {getFieldDecorator('app_id', {
                initialValue: filters.app_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Platform">
              {getFieldDecorator('platform', {
                initialValue: filters.platform
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
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
            <FormItem label="Campaign ID">
              {getFieldDecorator('campaignId', {
                initialValue: filters.campaignId
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Target Code">
              {getFieldDecorator('target_code', {
                initialValue: filters.target_code
              })(<Select
                showSearch
                mode="multiple"
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {optionListDb.TargetCode.map(c => (
                  <Select.Option key={c.id} value={c.code2}>
                    {c.code2}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Ad Type">
              {getFieldDecorator('ad_type', {
                initialValue: filters.ad_type,
              })(
                <Select
                  showSearch
                  mode='multiple'
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {adTypeOption.map(c => (
                    <Select.Option key={c.key} value={c.value}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Sen Account">
              {getFieldDecorator('account', {
                initialValue: filters.account,
              })(<Select
                showSearch
                mode='multiple'
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.Account && this.Account.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>)}
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
            <Button type="primary" icon="search" onClick={this.submit}>Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='companyAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(CampaignsSearch)
