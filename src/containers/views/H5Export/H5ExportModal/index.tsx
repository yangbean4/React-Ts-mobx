import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Radio, Select, Button, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { preclicks } from '../config'


const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
    lg: { span: 5 },
    xl: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
    lg: { span: 8 },
    xl: { span: 6 }
  }
}


interface IProps {
  item?: IH5ExportStore.Iitem
  create?: (data: IH5ExportStore.Iitem) => Promise<any>
  getChooseList?: () => void
  clearItem?: () => void
  getSubsiteInfo?: () => void
  optionListDb?: IH5ExportStore.OptionListDb
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IProps => {
    const { h5ExportStore, routerStore } = store
    const { item, optionListDb, getChooseList, getSubsiteInfo } = h5ExportStore
    return { routerStore, item, optionListDb, getChooseList, getSubsiteInfo }
  }
)
@observer
class TaskModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private chooseListForAppid: IH5ExportStore.ChooseListItem[] = [];

  @observable
  private pids: string[] = [];

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @computed
  get appidList() {
    return Object.values(this.props.optionListDb.chooseList).map(v => v[0])
  }

  @action
  setChooseListForAppid = (appid) => {
    const appkey = appid || this.props.form.getFieldValue('app_id')
    const chooseList = this.props.optionListDb.chooseList
    if (appkey && chooseList[appkey]) {
      return this.chooseListForAppid = chooseList[appkey]
    }
    this.chooseListForAppid = [].concat.apply([], Object.values(chooseList))
  }

  /**
   * 选择appid后清空campaign_id的值
   */
  chooseAppId = (value) => {
    this.props.form.setFieldsValue({
      campaign_id: '',
      offer_id: '',
      offer_status: '--'
    })
    this.setChooseListForAppid(value)
  }

  chooseCampaignId = (value) => {
    if (!value) {
      this.props.form.setFieldsValue({
        app_id: ''
      })
      this.setChooseListForAppid('')
      return;
    }
    const item = this.chooseListForAppid.find(v => v.campaign_id === value)
    item && this.props.form.setFieldsValue({
      app_id: item.app_key,
      offer_id: item.id,
      offer_status: item.offer_status || '--'
    })

  }

  chooseOfferId = (value) => {
    if (!value) {
      this.props.form.setFieldsValue({
        app_id: ''
      })
      this.setChooseListForAppid('')
      return;
    }
    const item = this.chooseListForAppid.find(v => v.id === value)
    item && this.props.form.setFieldsValue({
      app_id: item.app_key,
      campaign_id: item.campaign_id,
      offer_status: item.offer_status
    })
  }

  @action
  chooseSubsite = (value) => {
    const item = this.props.optionListDb.subsiteInfo.find(v => v.dev_id === value);
    if (!item) return;
    this.pids = item.placement_id.split(',');
    this.props.form.setFieldsValue({
      token: item.token,
      pid: ''
    })
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { routerStore, form } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            let data = { message: '' }
            data = await this.api.h5Export.create(values)
            message.success(data.message)
            routerStore.push('/h5Export')
          } catch (err) {
            console.error(err);
          }
          this.toggleLoading()
        }
      }
    )
  }

  async componentWillMount() {
    this.props.getSubsiteInfo()
    await this.props.getChooseList()
    this.setChooseListForAppid('')
  }

  render() {
    const { item, form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <div className='sb-form'>
        <Form className={styles.taskModal} >
          <FormItem {...formItemLayout} label="App ID">
            {getFieldDecorator('app_id', {
              initialValue: item.app_id,
              rules: [{ required: true, message: "Required" }]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                onChange={this.chooseAppId}
              >
                {this.appidList.map(c => {
                  return <Select.Option key={c.app_key} value={c.app_key}>
                    {c.app_key}_{c.app_id}
                  </Select.Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Campaign">
            {getFieldDecorator('campaign_id', {
              initialValue: item.campaign_id,
              rules: [{ required: true, message: "Required" }]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                onChange={this.chooseCampaignId}
              >
                {this.chooseListForAppid.map(c => {
                  return <Select.Option key={c.campaign_id} value={c.campaign_id}>
                    {c.campaign_id}_{c.campaign_name}
                  </Select.Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Offer ID">
            {getFieldDecorator('offer_id', {
              initialValue: item.offer_id,
              rules: [{ required: true, message: "Required" }]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                onChange={this.chooseOfferId}
              >
                {this.chooseListForAppid.map(c => {
                  return <Select.Option key={c.campaign_id} value={c.id}>
                    {c.id}
                  </Select.Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Offer Status">
            {getFieldDecorator('offer_status', {
              initialValue: '',
            })(<Input disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label="Subsite">
            {getFieldDecorator('dev_id', {
              initialValue: item.dev_id,
              rules: [{ required: true, message: "Required" }]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                onChange={this.chooseSubsite}
              >
                {optionListDb.subsiteInfo.map(c => {
                  return <Select.Option key={c.dev_id} value={c.dev_id}>
                    {c.dev_id}_{c.pkg_name}
                  </Select.Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Token">
            {getFieldDecorator('token', {
              initialValue: item.token,
              rules: [{ required: true, message: "Required" }]
            })(<Input disabled />)}
          </FormItem>
          <FormItem {...formItemLayout} label="PID">
            {getFieldDecorator('pid', {
              initialValue: item.pid,
              rules: [{ required: true, message: "Required" }]
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.pids.map(c => {
                  return <Select.Option key={c} value={c}>
                    {c}
                  </Select.Option>
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Preclick">
            {getFieldDecorator('preclick', {
              initialValue: 1,
              rules: [{ required: true, message: "Required" }]
            })(
              <Radio.Group>
                {preclicks.map(c => (
                  <Radio {...c}>
                    {c.key}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </FormItem>
          <FormItem className={styles.btnBox}>
            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
          </FormItem>
        </Form>
      </div >
    )
  }
}

export default Form.create<IProps>()(TaskModal)
