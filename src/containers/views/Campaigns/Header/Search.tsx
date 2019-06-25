import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, autorun } from 'mobx'
import { Form, Input, Row, Col, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { platformOption } from '../web.config'

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
  setCampaignType?: (str: string) => void
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, campaignStore } = store
    const { changeFilter, filters, setCampaignType } = campaignStore
    return { changeFilter, filters, routerStore, setCampaignType }
  }
)
@observer
class CampaignsSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private companyType: string = ''

  private IReactionDisposer: () => void
  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  constructor(props) {
    super(props)
    this.IReactionDisposer = autorun(
      () => {
        const companyType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        if (companyType !== this.companyType) {
          runInAction('SET_TYPE', () => {
            this.companyType = companyType
          })
          this.props.form.resetFields()
          this.props.setCampaignType(companyType)
          return true
        }
        return false
      }
    )
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
            <Col span={3} offset={1}>
                <Button type="primary" onClick={this.submit}>Search</Button>
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
