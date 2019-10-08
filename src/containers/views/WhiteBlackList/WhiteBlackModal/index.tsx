import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Form, Input, Checkbox, Select, Button, message, Tooltip, Row, Col, Radio, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { match } from 'react-router';
import { RadioChangeEvent } from 'antd/lib/radio'
import PlacementCampaignGroup from './PlacementCampaignGroup'

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
  getAppidCampaign?: () => void
  getPkgNamePlacement?: () => void
  clearItem?: () => void
  getItem?: (data: any) => void
  optionListDb?: IWhiteBlackListStore.OptionListDb
  routerStore?: RouterStore
  match?: match
}

@inject(
  (store: IStore): IProps => {
    const { whiteBlackListStore, routerStore } = store
    const { item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem, getAppidCampaign, getPkgNamePlacement } = whiteBlackListStore
    return { routerStore, item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem, getAppidCampaign, getPkgNamePlacement }
  }
)
@observer
class TaskModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private isEdit: boolean = false

  @observable
  private placementList = [];

  @observable
  private campaignList = [];

  @observable
  private disabledAll: boolean = true

  @observable
  private currentLimited: number = 0

  @observable
  private currentCategory: number[] = []

  @observable
  private appids = [];

  @observable
  private selectPlatformAppids = [];

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  getItem = (id) => {
    this.isEdit = true;
    this.props.getItem({ id });
    // todo: 编辑时 currentLimited 和 currentCategory 需要等于返回的值
  }

  @action
  limitedChanged = (e: RadioChangeEvent) => {
    this.currentLimited = e.target.value
    // 设置为limited时需要检查appid blacklist已选项中是否包含已经取消的选项
    const appids = this.appids = this.getAppids(e.target.value, this.currentCategory);
    const selectObj = this.props.form.getFieldsValue(['category_whitelist', 'app_id_blacklist']);
    // todo: 还有campaign要获取
    // 切换到Limited
    if (e.target.value === 1) {
      if (selectObj.app_id_blacklist.length === 0) return this.appids = appids;
      return Modal.confirm({
        title: 'Attention，App ID Blacklist and Campaign will only show the relevant data. Confirm to Continue?',
        content: '',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        centered: true,
        onOk: () => {
          this.props.form.setFieldsValue({
            app_id_blacklist: selectObj.category_whitelist.length === 0
              ? []
              : selectObj.app_id_blacklist.filter(v => appids.find(m => m.app_id === v))
          })
        },
        onCancel: () => {
          this.props.form.setFieldsValue({ limited: 0 })
        }
      })
    }
  }

  @action
  categoryChanged = (value: number[]) => {
    // 判断是添加选中 还是取消选中
    const isAdd = this.currentCategory.length < value.length;
    // 操作的category
    const actionId = isAdd
      ? []
      : this.currentCategory.filter(v => !value.includes(v))[0]

    const appids = this.getAppids(1, value);
    // 如果是添加则不处理
    if (isAdd) {
      this.currentCategory = value;
      this.appids = appids;
      return;
    }

    const selectObj = this.props.form.getFieldsValue(['app_id_blacklist']);
    let toDeleteAppids = [];
    if (selectObj.app_id_blacklist.length > 0 && (toDeleteAppids = this.appids.filter(v => selectObj.app_id_blacklist.includes(v.app_id)).filter(v => v.campaign.find(m => m.category_id == actionId)).map(v => v.app_id)).length > 0) {
      const categoryName = this.props.optionListDb.Category.find(v => v.id === actionId).name;

      return Modal.confirm({
        title: `Confirm to deselect ${categoryName} in Category Whitelist and also delete ${toDeleteAppids.join(', ')} in App ID Blacklist?`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        centered: true,
        onCancel: () => {
          this.props.form.setFieldsValue({ category_whitelist: this.currentCategory })
        },
        onOk: () => {
          this.props.form.setFieldsValue({
            app_id_blacklist: selectObj.app_id_blacklist.filter(v => !toDeleteAppids.includes(v))
          })
          runInAction(() => {
            this.currentCategory = value;
            this.appids = appids;
          })
        }
      })
    }

    this.currentCategory = value;
    this.appids = appids;
  }

  @action
  pkgNameChanged = (value: number[]) => {
    if (value.length === 0) {
      return this.disabledAll = true;
    }
    this.disabledAll = false;
    const selectPkgname = this.props.optionListDb.PkgNamePlacement.filter(v => value.includes(v.id));
    const placements = selectPkgname.map(v => v.platform);
    this.selectPlatformAppids = this.appids = this.props.optionListDb.AppidCampaign.filter(item => placements.includes(item.platform));

    this.placementList = [].concat(...selectPkgname.map(v => v.placement));

    this.campaignList = [].concat(...this.appids.map(v => v.campaign));
  }

  /**
   * 获取limite和category约束下的appid带选项
   */
  getAppids = (limited: number, category: number[]) => {
    const appids = (this.selectPlatformAppids || this.props.optionListDb.AppidCampaign);
    return limited === 0
      ? appids
      : appids.filter(item =>
        item.campaign.filter(v => category.includes(+v.category_id)).length
      );
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

  componentDidMount() {
    this.props.getCategory();
    this.props.getAppidCampaign();
    this.props.getPkgNamePlacement();
    if ((this.props.match.params as any).id) {
      this.getItem(+(this.props.match.params as any).id)
    } else {
      // this.props.getPkgname();
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
                  onChange={this.pkgNameChanged}
                  filterOption={(input, option) => option.props.children.props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {optionListDb.PkgNamePlacement.map(c => {
                    return <Select.Option key={c.id} value={c.id} disabled={c.disabled}>
                      <AutoTooltip title={`${c.id}_${c.pkg_name}`}></AutoTooltip>
                    </Select.Option>
                  })}
                </Select>
              )
            )}
          </FormItem>
          <Row>
            <Col {...formItemLayout.labelCol} className="ant-form-item-label">
              <label className="ant-form-item-required">Category Whitelist</label>
            </Col>
            <Col {...formItemLayout.wrapperCol} {...{ lg: 15, xl: 14 }} >
              <FormItem>
                {getFieldDecorator('limited', {
                  initialValue: item.limited || this.currentLimited
                })(<Radio.Group onChange={this.limitedChanged} disabled={this.disabledAll}>
                  <Radio value={0}>Unlimited</Radio>
                  <Radio value={1}>Limited</Radio>
                </Radio.Group>)}
              </FormItem>
              <FormItem>
                {getFieldDecorator('category_whitelist', {
                  initialValue: item.category_whitelist || [],
                  rules: [{
                    validator: (rule, value, cb) => {
                      // 编辑模式下不效验
                      // limit等于Unlimited时也不效验
                      if (this.currentLimited === 0 || this.isEdit) return cb();
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
                })(<Checkbox.Group className={styles.categoryList}
                  disabled={this.disabledAll || this.currentLimited === 0}
                  onChange={this.categoryChanged}
                  options={optionListDb.Category.map(c => {
                    return {
                      label: c.name,
                      value: c.id
                    }
                  })} />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem  {...formItemLayout} wrapperCol={{ ...formItemLayout.wrapperCol, lg: 8 }} label="App ID Blacklist" extra="* One App ID per line" className={styles.showExtra}>
            {getFieldDecorator('app_id_blacklist', {
              initialValue: item.app_id_blacklist || [],
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
            })(<Select
              mode="multiple"
              disabled={this.disabledAll}>
              {this.appids.map(c => {
                return <Select.Option key={c.app_id} value={c.app_id}>
                  {c.app_id}
                </Select.Option>
              })}
            </Select>)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('placement_campaign', {
              initialValue: item.placement_campaign || [],
            })(<PlacementCampaignGroup
              campaignList={this.campaignList}
              placementList={this.placementList} />)}
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
