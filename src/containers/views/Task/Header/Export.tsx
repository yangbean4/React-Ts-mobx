import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction, computed, has } from 'mobx'
import { Form, Select, DatePicker, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import moment from 'moment'
import * as styles from './index.scss'
import { igePreloadStatus, queryType } from '../web.config'

const FormItem = Form.Item
const { RangePicker } = DatePicker
const dateFormat = 'YYYYMMDD'

const formItemLayout = {
  labelCol: {
    sm: { span: 6 }
  },
  wrapperCol: {
    sm: { span: 18 }
  }
}

interface IProps {
  getOptionListDb?: () => void
  optionListDb?: ITaskStore.OptionListDb
  changepage?: (page: number) => void
  onSubmit?: () => void
  routerStore?: RouterStore
}

@inject(
  (store: IStore): IProps => {
    const { taskStore, routerStore } = store
    const { getOptionListDb, optionListDb } = taskStore
    return { routerStore, getOptionListDb, optionListDb }
  }
)
@observer
class TaskModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private queryLoading: boolean = false

  private export: ITaskStore.IExport = {};

  @observable
  private selectIgePkgname = [];

  @observable
  private pkgNameList = [];

  @observable
  private videosNum: number = null;

  @action
  toggleLoading = (type: queryType) => {
    if (type === queryType.query) {
      this.queryLoading = !this.queryLoading
    } else {
      this.loading = !this.loading
    }
  }

  @computed
  get appIdList() {
    // 展开数组
    const r = [].concat.apply([], Object.values(this.props.optionListDb.IgePkgname));
    console.log(r.length)
    // 因为列表中的appid存在重复的,所以对数组进行去重
    let hash = {};
    r.forEach(v => {
      if (!hash[v.app_id]) {
        hash[v.app_id] = v
      }
    })
    return Object.values(hash)
  }

  /**
   * 选择ige pkgname 设置appid选项
   */
  @action
  changeIgePkgname = (value: string) => {
    this.selectIgePkgname = this.props.optionListDb.IgePkgname[value] || [];
    this.props.form.setFieldsValue({
      app_id: [],
      pkg_name: []
    })
    this.pkgNameList = [];
  }

  @action
  getPkgnameList = async (appid: string) => {
    const res = await this.api.task.getPkgNameList({
      app_id: appid
    })
    runInAction('SET_PKGNAMELIST', () => {
      this.pkgNameList = res.data
    })
  }


  /**
   * appid变更后获取有关数据
   */
  @action
  changeAppid = (app_id: string[]) => {

    this.getPkgnameList(app_id.join(','));
    this.props.form.setFieldsValue({
      pkg_name: []
    })
  }

  @action
  getDemoNum = (type: queryType) => {
    const { validateFields } = this.props.form;
    validateFields(async (err, values) => {
      if (err) return;
      const date = values.date;
      delete values.date;
      values.app_id = values.app_id.join(',')
      values.pkg_name && (values.pkg_name = values.pkg_name.join(','))
      values.geo && (values.geo = values.geo.join(','))
      values.ige_preload_status && (values.ige_preload_status = values.ige_preload_status.join(','))
      this.toggleLoading(type)
      let res = await this.api.task.getDemoNum({
        ...values,
        report_date: date ? date.map(m => m.format(dateFormat)).join(',') : undefined,
        type: type
      }, type === queryType.export ? {
        responseType: 'blob'
      } : undefined);

      if (type === queryType.query) {
        runInAction('SET_VIDEO_NUM', () => {
          this.videosNum = res.data
        })
      } else {
        if (res.status === 201) {
          this.toggleLoading(type)
          return message.warn('There is no data to export. Please change the filter！')
        }
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(res.data);
        a.download = `basicdata_${moment().format(dateFormat)}.xlsx`
        a.click()
        this.props.onSubmit && this.props.onSubmit();
      }
      this.toggleLoading(type)
    })
  }


  Cancel = () => {
    this.props.routerStore.push('/task')
  }


  componentWillMount() {
    this.props.getOptionListDb();
  }

  render() {
    const { form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <div className='sb-form'>
        <Form className={styles.exportModal} >
          <FormItem {...formItemLayout} label="IGE Pkgname">
            {getFieldDecorator('ige_pkgname', {
              initialValue: this.export.ige_pkgname,
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                onChange={this.changeIgePkgname}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {Object.keys(optionListDb.IgePkgname).map(c => (
                  <Select.Option key={c} value={c}>
                    {c}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="APP ID">
            {getFieldDecorator('app_id', {
              initialValue: this.export.app_id,
              rules: [
                { required: true, message: "Required" }
              ]
            })(
              <Select
                allowClear
                showSearch
                mode="multiple"
                onChange={this.changeAppid}
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {((this.selectIgePkgname.length && this.selectIgePkgname) || this.appIdList).map(c => (
                  <Select.Option key={c.app_id} value={c.app_id}>
                    {c.t}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="GEO">
            {getFieldDecorator('geo', {
              initialValue: this.export.geo
            })(
              <Select
                allowClear
                showSearch
                mode="multiple"
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {optionListDb.Country.map(c => (
                  <Select.Option key={c.id} value={c.code2}>
                    {c.code2}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="IGE Preload Status">
            {getFieldDecorator('ige_preload_status', {
              initialValue: this.export.ige_preload_status
            })(
              <Select
                allowClear
                showSearch
                mode="multiple"
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {igePreloadStatus.map(c => (
                  <Select.Option key={c.key} value={c.value}>
                    {c.key}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Date">
            {getFieldDecorator('date', {
              initialValue: []
            })(
              <RangePicker format={dateFormat} />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="Pkgname">
            {getFieldDecorator('pkg_name', {
              initialValue: this.export.pkg_name,
            })(
              <Select
                allowClear
                showSearch
                mode="multiple"
                getPopupContainer={trigger => trigger.parentElement}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.pkgNameList.map(c => (
                  <Select.Option key={c} value={c}>
                    {c}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>

          <FormItem style={{ textAlign: 'right', marginBottom: 0 }}>
            {
              this.videosNum !== null ? (
                <span className={styles.videoMsg}>{this.videosNum} videos</span>
              ) : undefined
            }
            <Button type="primary" loading={this.queryLoading} onClick={() => this.getDemoNum(queryType.query)}>Query</Button>
            <Button type="primary" style={{ marginLeft: '10px' }} loading={this.loading} onClick={() => this.getDemoNum(queryType.export)}>Export</Button>
          </FormItem>
        </Form>
      </div >
    )
  }
}

export default Form.create<IProps>()(TaskModal)
