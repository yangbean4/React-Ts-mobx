import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, autorun } from 'mobx'
import { Form, Input, Select, Row, Col, Button } from 'antd'
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
  changeFilter?: (params: ICompanyStore.SearchParams) => void
  filters?: ICompanyStore.SearchParams
  routerStore?: RouterStore
  setCompanyType?: (str: string) => void
}



@inject(
  (store: IStore): IStoreProps => {
    const { routerStore } = store
    const { changeFilter, filters, setCompanyType } = store.companyStore
    return { changeFilter, filters, routerStore, setCompanyType }
  }
)
@observer
class CompanySearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
          this.props.setCompanyType(companyType)
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
                <FormItem label="Source Company">
                {getFieldDecorator('company_name', {
                    initialValue: filters.company
                })(<Input autoComplete="off" />)}
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

export default Form.create<IStoreProps>()(CompanySearch)
