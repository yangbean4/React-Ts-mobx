import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, autorun } from 'mobx'
import { Form, Input, Row, Col, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
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
  changeFilter?: (params: IManualEcpmStore.SearchParams) => void
  filter?: IManualEcpmStore.SearchParams
  getManualList?: () => Promise<any>
  routerStore?: RouterStore
  setAppIdCampaigns?: () => Promise<any>
  setCountrys?: () => Promise<any>
  AppIdCampaigns?: []
  country?: []
  pidList?: []
  setPidType?: () => Promise<any>

  // getTargetCode?: () => Promise<any>
  // setCampaignType?: (str: string) => void
  // optionListDb?: IManualEcpmStore.OptionListDb
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, manualEcpmStore } = store
    const { setPidType, pidList, changeFilter, AppIdCampaigns, country, setCountrys, filter, getManualList, setAppIdCampaigns } = manualEcpmStore
    return { setPidType, pidList, changeFilter, filter, country, setCountrys, routerStore, getManualList, setAppIdCampaigns, AppIdCampaigns }
  }
)
@observer
class CampaignsSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }


  componentWillMount() {
    this.props.setCountrys()
    this.props.getManualList()
    // this.props.setAppIdCampaigns()
    this.props.setPidType()

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
    const { form, filter, country, pidList, } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="App ID">
              {getFieldDecorator('app_id', {
                initialValue: filter.app_id
              })(
                <Input autoComplete="off" />
              )}
            </FormItem>
          </Col>

          <Col span={span}>
            <FormItem label="Campaign ID">
              {getFieldDecorator('campaign_id', {
                initialValue: filter.campaign_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="GEO">
              {getFieldDecorator('country', {
                initialValue: filter.country
              })(<Select
                showSearch
                mode="multiple"
                maxTagCount={2}
                // getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {country.map(c => (
                  <Select.Option key={c.id} value={c.code2}>
                    {c.code2}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Pkg Name">
              {getFieldDecorator('pkg_name', {
                initialValue: filter.pkg_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="PID">
              {getFieldDecorator('pid', {
                initialValue: filter.pid
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="PID Type">
              {getFieldDecorator('pid_type', {
                initialValue: filter.pid_type,
              })(
                <Select
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  // getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {pidList.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
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
            <span id='ManualAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(CampaignsSearch)
