import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { pidTypes } from '../config'
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
  changeFilter?: (params: ICreativeFrequencyStore.SearchParams) => void,
  filters?: ICreativeFrequencyStore.SearchParams,
  getCreativeList?: () => void,
  optionListDb?: ICreativeFrequencyStore.OptionListDb
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter, filters, getCreativeList, optionListDb } = store.creativeFrequencyStore
    return { changeFilter, filters, getCreativeList, optionListDb }
  }
)
@observer
class Search extends ComponentExt<IStoreProps & FormComponentProps> {

  constructor(props) {
    super(props);
    this.props.getCreativeList();
  }

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
          this.toggleLoading();
          if (values.creative && (values.creative.length === 0 || values.creative.includes(0))) {
            delete values.creative;
          }
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
            <FormItem label="Pkg Name" className={styles.searchInput}>
              {getFieldDecorator('pkg_name', {
                initialValue: filters.pkg_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="PID Type">
              {getFieldDecorator('pid_type', {
                initialValue: filters.pid_type
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  style={{ width: 210 }}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {pidTypes.map(c => (
                    <Select.Option {...c}>
                      {c.key}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Creative" className='minInput'>
              {getFieldDecorator('creative', {
                initialValue: filters.creative
              })(
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  maxTagCount={1}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Select.Option key='null' value={0}>All</Select.Option>
                  {optionListDb.creatives.map(c => (
                    <Select.Option key={c.id} value={c.id}>
                      {`${c.id}-${c.name}`}
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
            <span id='h5ExportAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(Search)
