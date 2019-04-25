import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../as.config'

const FormItem = Form.Item

const span = 7
const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18
  }
}

interface IStoreProps {
  getConfigsList?: () => Promise<any>
  filters?: IConfigStore.SearchParams
  changeFilter?: (params: IConfigStore.SearchParams) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { getConfigsList, changeFilter ,filters} = store.configStore
    return { getConfigsList, changeFilter,filters }
  }
)
@observer
class ConfigSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
      <Form {...layout} onSubmit={this.submit}>
        <Row>
          <Col span={span}>
            <FormItem label="Pkg Name">
              {getFieldDecorator('pkg_name', {
                initialValue: filters.pkg_name
              })(<Input />)}
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
            <Button type="primary" htmlType="submit">Search</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(ConfigSearch)