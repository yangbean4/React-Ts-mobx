import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, autorun } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { platformOption } from '@config/web'
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
  changeFilter?: (params: IEndcardStore.SearchParams) => void
  routerStore?: RouterStore
  filters?: IEndcardStore.SearchParams
}


@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    const { changeFilter, filters } = store.endcardStore
    return { changeFilter, filters, routerStore }
  }
)
@observer
class EndcardSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
  componentWillMount() {
    this.IReactionDisposer()
    this.props.routerStore.history.listen(route => {
      console.log('####')
        this.props.form.resetFields()
    })
  }

  componentDidMount() {
    this.props.routerStore.history.listen(route => {
        this.props.form.resetFields()
    })
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
            <FormItem label="App ID">
              {getFieldDecorator('app_id', {
                initialValue: filters.app_id
              })(<Input autoComplete="off" />)}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Platform" className='minInput'>
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
            <span id='endcardAddBtn'></span>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(EndcardSearch)
