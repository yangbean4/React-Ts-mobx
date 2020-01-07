import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Row, Col, Button } from 'antd'
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
  changeFilter?: (params: ILoadVideoStore.SearchParams) => void
  filters?: ILoadVideoStore.SearchParams
}



@inject(
  (store: IStore): IStoreProps => {
    const { changeFilter, filters } = store.loadVideoStore
    return { changeFilter, filters }
  }
)
@observer
class Search extends ComponentExt<IStoreProps & FormComponentProps> {
  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { changeFilter, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          try {
            changeFilter(values)
          } catch (err) {
            console.error(err)
          }
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
            <FormItem label="Pkg Name">
              {getFieldDecorator('pkg_name', {
                initialValue: filters.pkg_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Bundle ID">
              {getFieldDecorator('bundle_id', {
                initialValue: filters.bundle_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Template Name">
              {getFieldDecorator('template_name', {
                initialValue: filters.template_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Template Md5">
              {getFieldDecorator('template_md5', {
                initialValue: filters.template_md5
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='creativeAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(Search)
