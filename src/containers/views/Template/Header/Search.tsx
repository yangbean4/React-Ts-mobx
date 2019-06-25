import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, autorun } from 'mobx'
import { Form, Input, Row, Col, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { camelCase } from '@utils/index'
const FormItem = Form.Item

const span = 7
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16
  }
}

interface IStoreProps {
  getTemplates?: () => Promise<any>
  changeFilter?: (params: ITemplateStore.SearchParams) => void
  changepage?: (page: number) => void
  templateConfig?: TemplateConfig
  template_pid?: number
}

@inject(
  (store: IStore): IStoreProps => {
    const { getTemplates, changepage, changeFilter, templateConfig, template_pid } = store.templateStore
    return { getTemplates, changepage, changeFilter, templateConfig, template_pid }
  }
)
@observer
class TemplateSearch extends ComponentExt<IStoreProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  private template_pid: number

  constructor(props) {
    super(props)
    // autorun(
    //   () => {
    //     if (this.template_pid !== this.props.template_pid) {
    //       this.template_pid = this.props.template_pid;
    //       this.props.form.resetFields()
    //     }
    //   }
    // )
  }

  @computed
  get searchList() {
    const obj: object = this.props.templateConfig.search_filed;
    return Object.entries(obj).filter(([key, value]) => !!value).map(([key, value]) => key)
  }

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
    const { getFieldDecorator } = this.props.form

    return (
      this.searchList.length ? (
        <Form {...layout} className='childLeftSearch'>
          {
            this.searchList.includes('template_name') &&
            <FormItem label={camelCase('template_name')}>
              {getFieldDecorator('template_name')(<Input autoComplete="off" />)}
            </FormItem>
          }
          {
            this.searchList.includes('template_md5') &&
            <FormItem label={camelCase('template_md5')}>
              {getFieldDecorator('template_md5')(<Input autoComplete="off" />)}
            </FormItem>
          }
          {
            this.searchList.includes('version') &&
            <FormItem label={camelCase('version')}>
              {getFieldDecorator('version')(<Input autoComplete="off" />)}
            </FormItem>
          }
          <Button type="primary" className='addbtn-ml20 addbtn-mb20' onClick={() => this.submit()} >Search</Button>
          <span id='templateAddBtn' className='addbtn-mb20'>
          </span>
        </Form>
      )
        : null
    )
  }
}

export default Form.create<IStoreProps>()(TemplateSearch)
