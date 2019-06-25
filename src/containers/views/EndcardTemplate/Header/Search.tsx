import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, autorun } from 'mobx'
import { Form, Input, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'

const FormItem = Form.Item

const span = 6
const layout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19
  }
}

interface IStoreProps {
  getEndcardTemplates?: () => Promise<any>
  routerStore?: RouterStore
  changeFilter?: (params: IEndcardTemplateStore.SearchParams) => void
  changepage?: (page: number) => void
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    const { getEndcardTemplates, changepage, changeFilter } = store.endcardTemplateStore
    return { getEndcardTemplates, changepage, changeFilter, routerStore }
  }
)
@observer
class CustomSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private IReactionDisposer: () => void

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
  componentDidMount() {
    this.IReactionDisposer()
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
    const { form } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="Template ID">
              {getFieldDecorator('template_id')(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Template Name">
              {getFieldDecorator('template_name')(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={3} offset={1}>
            <Button type="primary" onClick={this.submit}>Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='customAddBtn'></span>
          </Col>

        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(CustomSearch)
