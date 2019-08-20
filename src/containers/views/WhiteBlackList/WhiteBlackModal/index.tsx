import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { Form, Input, Checkbox, Select, Button, message, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { match } from 'react-router';


const FormItem = Form.Item
const AppIdRegExp = /^[\s,]*?[\w\.]*?[\s,]*?$/;
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

interface AutoProps {
  title?: string
}

/**
 * 包装一下Tooltip 如果内容过宽 显示...的情况下 显示Tooltip
 */
@observer
class AutoTooltip extends ComponentExt<AutoProps> {

  static parentWidth = null;

  @observable
  private show: boolean = false

  @action
  hideHandler = () => {
    this.show && (this.show = false);
  }

  @action
  showHandler = () => {
    if (AutoTooltip.parentWidth === null)
      AutoTooltip.parentWidth = (this.refs.el as HTMLElement).parentElement.offsetWidth - 40;
    const textW = (this.refs.el as HTMLElement).offsetWidth
    if (AutoTooltip.parentWidth < textW) {
      this.show = true;
    }
  }

  render() {
    return <span ref="el">
      <Tooltip visible={this.show} placement="top" title={this.props.title}>
        <span onMouseOver={this.showHandler} onMouseOut={this.hideHandler}>{this.props.title}</span>
      </Tooltip>
    </span>
  }
}

interface IProps {
  item?: IWhiteBlackListStore.Iitem
  create?: (data: IWhiteBlackListStore.Iitem) => Promise<any>
  update?: (data: IWhiteBlackListStore.Iitem) => Promise<any>
  getPkgname?: () => void
  getCategory?: () => void
  clearItem?: () => void
  getItem?: (data: any) => void
  optionListDb?: IWhiteBlackListStore.OptionListDb
  routerStore?: RouterStore
  match?: match
}

@inject(
  (store: IStore): IProps => {
    const { whiteBlackListStore, routerStore } = store
    const { item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem } = whiteBlackListStore
    return { routerStore, item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem }
  }
)
@observer
class TaskModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private isEdit: boolean = false


  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }
  @action
  getItem = (id) => {
    this.isEdit = true;
    this.props.getItem({ id })
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { routerStore, create, form, update } = this.props
    form.validateFields(
      async (err, values): Promise<any> => {
        if (!err) {
          this.toggleLoading()
          try {
            values.app_id_blacklist = values.app_id_blacklist.split(/\n/).map(_ => _.replace(/(^[,\s]+)|([,\s]+$)/g, '')).filter(_ => _).join(',')
            if (Array.isArray(values.pkg_name))
              values.pkg_name = values.pkg_name.join(',')
            let data = { message: '' }
            if (this.isEdit) {
              data = await update({ ...values, dev_id: this.props.item.dev_id })
            } else {
              data = await create(values)
            }
            message.success(data.message)
            routerStore.push('/whiteBlackList')
          } catch (err) {
            console.error(err);
          }
          this.toggleLoading()
        }
      }
    )
  }

  componentWillMount() {
    this.props.getCategory();
    if ((this.props.match.params as any).id) {
      this.getItem(+(this.props.match.params as any).id)
    } else {
      this.props.getPkgname();
      this.props.clearItem();
    }
  }

  render() {
    const { item, form, optionListDb } = this.props
    const { getFieldDecorator } = form
    return (
      <div className='sb-form'>
        <Form className={styles.taskModal} >
          <FormItem {...formItemLayout} label="Pkgname">
            {getFieldDecorator('pkg_name', {
              initialValue: item.pkg_name,
              rules: [{ required: true, message: "Required" }],

            })(this.isEdit ? (
              <Input disabled></Input>
            ) : (
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  getPopupContainer={trigger => trigger.parentElement}
                  filterOption={(input, option) => option.props.children.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.PkgnameData.map(c => {
                    return <Select.Option key={c.id} value={c.id} disabled={c.disabled}>
                      <AutoTooltip title={`${c.id}_${c.pkg_name}`}></AutoTooltip>
                    </Select.Option>
                  })}
                </Select>
              )
            )}
          </FormItem>
          <FormItem {...formItemLayout} wrapperCol={{ ...formItemLayout.wrapperCol, lg: 15, xl: 14 }} label="Category Whitelist">
            {getFieldDecorator('category_whitelist', {
              initialValue: item.category_whitelist || [],
              rules: [{
                validator: (rule, value, cb) => {
                  // 编辑模式下不效验
                  if (this.isEdit) return cb();
                  const appid = this.props.form.getFieldValue('app_id_blacklist');
                  if (value.length === 0 && !appid) {
                    return cb('Failure! Category Whitelist and App ID Blacklist cannot be empty at the same time.')
                  }
                  if (!appid) {
                    this.props.form.validateFields(['app_id_blacklist']);
                  }
                  cb();
                }
              }]
            })(<Checkbox.Group className={styles.categoryList} options={optionListDb.Category.map(c => {
              return {
                label: c.name,
                value: c.id
              }
            })} />)}
          </FormItem>
          <FormItem  {...formItemLayout} wrapperCol={{ ...formItemLayout.wrapperCol, lg: 8 }} label="App ID Blacklist" extra="* One App ID per line" className={styles.showExtra}>
            {getFieldDecorator('app_id_blacklist', {
              initialValue: item.app_id_blacklist ? item.app_id_blacklist.join('\n') : '',
              rules: [{
                validator: (rule, value, cb) => {
                  // 编辑时 category 和 appid 可以同时为空
                  if (this.isEdit === false) {
                    const category = this.props.form.getFieldValue('category_whitelist');
                    if (!value && category.length === 0) {
                      return cb('Failure! Category Whitelist and App ID Blacklist cannot be empty at the same time.')
                    }
                    if (category.length === 0) {
                      this.props.form.validateFields(['category_whitelist']);
                    }
                  }
                  const arr: string[] = value.split('\n')
                  if (!arr.every(v => AppIdRegExp.test(v))) {
                    return cb('* One App ID per line')
                  }
                  cb();
                }
              }]
            })(<Input.TextArea rows={10} />)}
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
