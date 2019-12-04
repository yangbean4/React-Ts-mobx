import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Row, Col, Button, Select, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from '../MaskModal/index.scss'


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
  getMasks?: () => Promise<any>
  changeFilter?: (params: IMaskSubsiteStore.SearchParams) => void
  changepage?: (page: number) => void
  optionListDb?: IMaskSubsiteStore.OptionListDb
}

@inject(
  (store: IStore): IStoreProps => {
    const { getMasks, changepage, changeFilter, optionListDb } = store.maskStore
    return { getMasks, changepage, changeFilter, optionListDb }
  }
)
@observer
class MaskSearch extends ComponentExt<IStoreProps & FormComponentProps> {
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
    const { form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <Form {...layout} >
        <Row>
          <Col span={span}>
            <FormItem label="App ID" >
              {getFieldDecorator('app_key')(
                <Select
                  allowClear={true}
                  showSearch
                  mode='multiple'
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.appIdData.map(c => (
                    <Select.Option key={c.alias_key} value={c.alias_key}>
                      <Popover content={c.alias_key + '-' + c.app_id} placement="right" overlayClassName={styles.popovers}>
                        <div className={styles.textHidden}>
                          {c.alias_key + '-' + c.app_id}
                        </div>
                      </Popover>
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Pkg Name">
              {getFieldDecorator('subsite_id')(
                <Select
                  showSearch
                  mode='multiple'
                  allowClear={true}
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.pkgNameData.map(c => (
                    <Select.Option key={c.id} value={c.dev_id}>
                      {c.dev_id} - {c.pkg_name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={span}>
            <FormItem label="Primary Name">
              {getFieldDecorator('primary_name')(<Input autoComplete="off" />)}
            </FormItem>
          </Col>


          <Col span={3} offset={1}>
            <Button type="primary" icon="search" onClick={this.submit} htmlType="submit">Search</Button>
          </Col>
          <Col span={3} offset={1}>
            <span id='maskAddBtn'></span>
          </Col>

        </Row>
      </Form>
    )
  }
}

export default Form.create<IStoreProps>()(MaskSearch)
