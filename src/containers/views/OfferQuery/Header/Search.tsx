import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, autorun, runInAction } from 'mobx'
import { createForm } from '@utils/form'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { platformOption, creativeOption, adTypeOption, statusCampaignOption, statusOfferOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

const FormItem = Form.Item
const url = 'http://san-manage.test2.com/api/offerQuery/listDetail'

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
  changeFilter?: (params: IOfferQueryStore.SearchParams) => void
  filters?: IOfferQueryStore.SearchParams,
  getGeoList?: () => void
  getAccountList?: () => void
  optionListDb?: IOfferQueryStore.OptionListDb
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, offerQueryStore } = store
    const { changeFilter, filters, optionListDb, getGeoList, getAccountList } = offerQueryStore
    return { changeFilter, filters, routerStore, optionListDb, getGeoList, getAccountList }
  }
)
@observer
class OfferQuerySearch extends ComponentExt<IStoreProps & FormComponentProps> {

  @observable
  private loading: boolean = false

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  componentWillMount() {
    this.props.getGeoList()
    this.props.getAccountList()
  }
  componentDidMount() {

  }
  submit = (e?: React.MouseEvent, n?: number): void => {
    // if (e) {
    //   e.preventDefault()
    // }
    const { changeFilter, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            const data = {
              ...values,
              export: n,
            }
            if (!n) {
              changeFilter(data)
            } else {
              createForm(data, url)
            }

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
            <FormItem label="Offer ID" className={styles.searchInput}>
              {getFieldDecorator('id', {
                initialValue: filters.id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="App ID" className="minInput">
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
                  mode="multiple"
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
            <FormItem label="Creative Type">
              {getFieldDecorator('creative_type', {
                initialValue: filters.creative_type
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
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
            <FormItem label="GEO">
              {getFieldDecorator('geo', {
                initialValue: filters.geo
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.geo && optionListDb.geo.map((c) => (
                    <Select.Option key={c.id} value={c.code2}>
                      {c.code2}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Campaign ID" className="minInput">
              {getFieldDecorator('campaign_id', {
                initialValue: filters.campaign_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Account">
              {getFieldDecorator('account_id', {
                initialValue: filters.account_id
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.account_id && optionListDb.account_id.map((c) => (
                    <Select.Option key={c.id} value={c.name}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Ad Type">
              {getFieldDecorator('ad_type', {
                initialValue: filters.ad_type
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {adTypeOption.map((c) => (
                    <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Campaign Status">
              {getFieldDecorator('campaign_status', {
                initialValue: filters.campaign_status
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {statusCampaignOption.map((c) => (
                    <Select.Option key={c.value} value={c.key}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Offer Status">
              {getFieldDecorator('offer_status', {
                initialValue: filters.offer_status
              })(
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {statusOfferOption.map((c) => (
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
          <Col span={3} offset={1} onClick={(e) => this.submit(e, 1)}>
            <Button type="primary">
              Export
            </Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(OfferQuerySearch)
