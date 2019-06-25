import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'

const FormItem = Form.Item

const span = 6
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16
  }
}

interface IStoreProps {
  getRoles?: () => Promise<any>
  changeFilter?: (params: IRoleStore.SearchParams) => void
  changepage?: (page: number) => void
  filters?: IRoleStore.SearchParams
}

@inject(
  (store: IStore): IStoreProps => {
    const { getRoles, changepage, changeFilter, filters } = store.roleStore
    return { getRoles, changepage, changeFilter, filters }
  }
)
@observer
class RoleSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="Role Name">
              {getFieldDecorator('role_name', {
                initialValue: filters.role_name
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" onClick={this.submit}>Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='addRoleBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(RoleSearch)
