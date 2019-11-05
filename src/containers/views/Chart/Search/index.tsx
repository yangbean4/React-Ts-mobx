import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'

const FormItem = Form.Item
const { RangePicker } = DatePicker;
const dateFormat = 'YYYYMMDD'
const span = 6
const layout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 17
  }
}

const platformList = [
  {
    value: 'Android',
    key: 'android'
  },
  {
    value: 'iOS',
    key: 'ios'
  }
]


interface IStoreProps {
  changeFilter?: (filter: IChartStore.SearchGroup) => Promise<any>
  filters?: IChartStore.SearchGroup
  optionListDb?: IChartStore.OptionListDb
  getOptionListDb?: () => void,
  modelType?: string
}

@inject(
  (store: IStore): IStoreProps => {
    const { chartStore } = store
    const { changeFilter, filters, optionListDb, getOptionListDb, modelType } = chartStore
    return { changeFilter, filters, optionListDb, getOptionListDb, modelType }
  }
)

@observer
class ChartSearch extends React.Component<IStoreProps & FormComponentProps>{

  ranges = {}

  @observable
  private loading: boolean = false

  constructor(props) {
    super(props);
    const yesterday = moment().add(-1, 'days');
    this.ranges = {
      Today: [moment(), moment()],
      Yesterday: [yesterday, yesterday],
      'Last 3 Days': [moment().add(-3, 'days'), yesterday],
      'Last 7 Days': [moment().add(-7, 'days'), yesterday],
      'Last 30 Days': [moment().add(-30, 'days'), yesterday],
    }
  }

  @action
  toggleLoading = () => {
    this.loading = !this.loading;
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { changeFilter, form } = this.props
    form.validateFields(
      async (err, values) => {
        if (!err) {
          this.toggleLoading()
          try {
            if (values.date) {
              values.date = values.date.map(val => val.format(dateFormat)).join(' - ')
            }
            await changeFilter(values)
          } catch (err) { }
          this.toggleLoading()
        }
      }
    )
  }

  componentDidMount() {
    this.props.getOptionListDb();
    this.submit();
  }

  render() {
    const { form, filters, optionListDb, modelType } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form {...layout} colon={false}>
        <Row>
          <Col span={span}>
            <FormItem label="Date">
              {getFieldDecorator('date', {
                initialValue: [moment().add(-1, 'days'), moment().add(-1, 'days')]
              })(<RangePicker ranges={this.ranges} format={dateFormat} />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Platform">
              {getFieldDecorator('platform', {
                initialValue: filters.platform
              })(<Select
                allowClear
                showSearch
                mode='multiple'
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {platformList.map(c => (
                  <Select.Option key={c.key} value={c.key}>
                    {c.value}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>
          {modelType == '1' && <Col span={span}>
            <FormItem label="Pkg name">
              {getFieldDecorator('pkg_name', {
                initialValue: filters.pkg_name
              })(<Select
                allowClear
                showSearch
                mode='multiple'
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {optionListDb.pkgNameList.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.pkg_name}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>}

          <Col span={span}>
            <FormItem label="PID">
              {getFieldDecorator('pid', {
                initialValue: filters.pid
              })(<Select
                allowClear
                showSearch
                mode='multiple'
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {optionListDb.placementEcpmList.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.placement_name}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>

          {modelType == '1' && <Col span={span}>
            <FormItem label="Strategy">
              {getFieldDecorator('strategy', {
                initialValue: filters.strategy
              })(<Select
                allowClear
                showSearch
                mode='multiple'
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {optionListDb.strategyList.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.strategy_name}
                  </Select.Option>
                ))}
              </Select>)}
            </FormItem>
          </Col>}
          {modelType == '2' && <>
            <Col span={span}>
              <FormItem label="App ID">
                {getFieldDecorator('app_key', {
                  initialValue: filters.app_key
                })(<Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.appKeyList.map(c => (
                    <Select.Option key={c.app_key} value={c.app_key}>
                      {c.title}
                    </Select.Option>
                  ))}
                </Select>)}
              </FormItem>
            </Col>
            <Col span={span}>
              <FormItem label="Creative">
                {getFieldDecorator('creative_id', {
                  initialValue: filters.creative_id
                })(<Select
                  allowClear
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.creativeList.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>)}
              </FormItem>
            </Col>
          </>}
          <Col span={8}>
            <FormItem label="Impression ≥">
              {getFieldDecorator('impression', {
                initialValue: filters.impression || 500
              })(<Input type="number" />)}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" icon="search" onClick={this.submit} loading={this.loading} htmlType="submit">Search</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(ChartSearch)
