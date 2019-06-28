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
  changeFilter?: (params: ICommentGroupStore.SearchGroup) => void
  filters?: ICommentGroupStore.SearchGroup
  routerStore?: RouterStore
  setCommentType?: (str: string) => void
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, commentGroupStore } = store
    const { changeFilter, filters, setCommentType } = commentGroupStore
    return { changeFilter, filters, routerStore, setCommentType }
  }
)
@observer
class CommentSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private companyType: string = ''

  @observable
  private langauge: string[]

  private IReactionDisposer: () => void
  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  getLanaugeDetail = async() => {
    const res = await this.api.comment.getGroupLanguage() 
    runInAction('SET_LANGAUE', () => {
      this.langauge = res.data
    })
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
          this.props.setCommentType(companyType)
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
  componentWillMount() {
    this.getLanaugeDetail()
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
                <FormItem label="Group Name">
                {getFieldDecorator('group_name', {
                    initialValue: filters.id
                })(<Input autoComplete="off" />)}
                </FormItem>
            </Col>
            <Col span={span}>
                <FormItem label="Group Language">
                {getFieldDecorator('group_language', {
                    initialValue: filters.group_language
                })(
                  <Select
                    showSearch
                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    mode="multiple"
                  >
                    {
                      this.langauge && this.langauge.map((c, index) => (
                        <Select.Option key={index} value={c}>
                          {c}
                        </Select.Option>
                      ))
                    }
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

export default Form.create<IStoreProps>()(CommentSearch)
