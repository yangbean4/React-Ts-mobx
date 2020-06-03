import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import { Form, Input, Checkbox, Select, Button, message, Tooltip, Row, Col, Radio, Modal, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { match } from 'react-router';
import { RadioChangeEvent } from 'antd/lib/radio'
import PlacementCampaignGroup from './PlacementCampaignGroup'
import PortalsBtn from '@components/portalsBtn'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
    lg: { span: 10 },
    xl: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
    lg: { span: 14 },
    xl: { span: 12 }
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
  getAppidCampaign?: (formData) => void
  getPkgNamePlacement?: () => void
  clearItem?: () => void
  getItem?: (data: any) => void
  optionListDb?: IWhiteBlackListStore.OptionListDb
  routerStore?: RouterStore
  match?: match
  pkgNameAndBundleId: IConfigStore.iosAndAnd
  getAllConfig?: () => void
}

@inject(
  (store: IStore): IProps => {
    const { whiteBlackListStore, routerStore, configStore } = store
    const { pkgNameAndBundleId, getAllConfig } = configStore;
    const { item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem, getAppidCampaign, getPkgNamePlacement } = whiteBlackListStore
    return { routerStore, item, create, getPkgname, optionListDb, getCategory, getItem, update, clearItem, getAppidCampaign, getPkgNamePlacement, pkgNameAndBundleId, getAllConfig }
  }
)
@observer
class whiteBlackModal extends ComponentExt<IProps & FormComponentProps> {
  @observable
  private loading: boolean = false

  @observable
  private childTest: boolean = false

  @observable
  private isEdit: boolean = false

  @observable
  private placementList = [];

  @observable
  private campaignList = [];

  @observable
  private disabledAll: boolean = true

  @observable
  private blacklist: String[] = []


  @observable
  private currentLimited: number = 0

  @observable
  private currentCategory: number[] = []

  @observable
  private currentAppid: string[] = []

  @observable
  private appids = [];

  @observable
  private selectPlatformAppids = [];

  @observable
  private loaded = false;

  private cookieAppid: string[] = [];

  private cookiePlacementCampaign = [];

  @action
  toggleLoading = () => {
    this.loading = !this.loading
  }

  @action
  childTestChange = (type) => {
    this.childTest = type === undefined ? !this.childTest : type
  }

  @action
  getItem = async (id) => {
    this.isEdit = true;
    await this.props.getItem({ id });
    runInAction(() => {
      const { item } = this.props;
      // 检测当前数据中的appid是否存在于备选框中
      this.currentAppid = item.app_id_blacklist;
      this.currentCategory = item.category_whitelist;
      this.currentLimited = item.limited;
      this.disabledAll = false;
      // this.pkgNameChanged(id);
      const appids = this.props.optionListDb.AppidCampaign.filter(v => v.platform == item.platform);
      this.selectPlatformAppids = appids;
      this.appids = this.getAppids(item.limited, item.category_whitelist)
      this.placementList = item.placement;
      this.blacklist = this.props.pkgNameAndBundleId[item.platform]
      this.campaignList = [].concat(...this.appids.filter(v => !item.app_id_blacklist.includes(v.app_id)).map(v => v.campaign));
    })
  }

  @action
  limitedChanged = (e: RadioChangeEvent) => {
    this.currentLimited = e.target.value
    // 设置为limited时需要检查appid blacklist已选项中是否包含已经取消的选项
    const appids = this.getAppids(e.target.value, []);
    const selectObj = this.props.form.getFieldsValue(['category_whitelist', 'app_id_blacklist', 'placement_campaign']);
    const campaign_ids = [].concat(...selectObj.placement_campaign.map(v => v.campaign_id));

    const successFn = () => {
      this.campaignList = [].concat(...appids.map(v => v.campaign));
      this.appids = appids;
    }
    // 切换到 Unlimited
    if (e.target.value === 0 || (selectObj.app_id_blacklist.length === 0 && campaign_ids.length === 0)) {
      setImmediate(() => {
        this.props.form.setFieldsValue({
          category_whitelist: []
        });
      })
      this.currentCategory = [];
      return successFn()
    };

    return Modal.confirm({
      title: 'Attention，App ID Blacklist and Campaign will only show the relevant data. Confirm to Continue?',
      content: '',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: () => {
        this.cookieAppid = selectObj.app_id_blacklist;
        this.cookiePlacementCampaign = JSON.parse(JSON.stringify(selectObj.placement_campaign));
        runInAction(() => {
          successFn();
          const placement_campaign = selectObj.category_whitelist.length === 0
            ? selectObj.placement_campaign.map(v => {
              v.campaign_id = []
              return v;
            })
            : selectObj.placement_campaign.map(v => {
              v.campaign_id = v.campaign_id.filter(n => this.campaignList.find(m => m.campaign_id == n))
              return v;
            })
          const app_id_blacklist = selectObj.category_whitelist.length === 0
            ? []
            : selectObj.app_id_blacklist.filter(v => appids.find(m => m.app_id === v))

          this.props.form.setFieldsValue({
            app_id_blacklist,
            placement_campaign
          })
        })
      },
      onCancel: () => {
        this.props.form.setFieldsValue({ limited: 0 })
        runInAction(() => {
          this.currentLimited = 0
        })
      }
    })
  }

  @action
  categoryChanged = (value: number[]) => {
    // 判断是添加选中 还是取消选中
    const isAdd = this.currentCategory.length < value.length;
    // 操作的category
    const actionId = isAdd ? [] : this.currentCategory.filter(v => !value.includes(v))[0]
    // debugger

    const appids = this.getAppids(1, value);
    const campaignList = [].concat(...appids.filter(v => !this.currentAppid.includes(v.app_id)).map(v => v.campaign));

    const successFn = () => {
      this.currentCategory = value;
      this.appids = appids;
      this.campaignList = campaignList;
    }
    const selectObj = this.props.form.getFieldsValue(['app_id_blacklist', 'placement_campaign']);

    // 如果是添加则不处理
    if (isAdd) {
      successFn()
      // 如果添加的时候原来的appids或者campaign中选中了这次添加category相关的内容，则再次选中；
      if (this.cookieAppid.length) {
        let tempAppids = this.cookieAppid.filter(v => appids.find(m => m.app_id == v));
        if (tempAppids.length) {
          this.props.form.setFieldsValue({
            app_id_blacklist: Array.from(new Set([...selectObj.app_id_blacklist, ...tempAppids]))
          })
          this.cookieAppid = this.cookieAppid.filter(v => !tempAppids.includes(v));
        }
      }

      if (this.cookiePlacementCampaign.length) {
        let tempCampaign = [].concat(...this.cookiePlacementCampaign.map(v => v.campaign_id)).filter(v => campaignList.find(m => m.campaign_id == v));
        if (tempCampaign.length) {
          let o = {};
          this.cookiePlacementCampaign.forEach(item => {
            let t = tempCampaign.filter(v => item.campaign_id.includes(v));
            if (t) {
              o[item._key_] = t
            }
          })
          this.props.form.setFieldsValue({
            placement_campaign: selectObj.placement_campaign.map(v => {
              o[v._key_] && (v.campaign_id = Array.from(new Set([...v.campaign_id, ...o[v._key_]])))
              return v;
            })
          })
          this.cookiePlacementCampaign = this.cookiePlacementCampaign.map(item => {
            item.campaign_id = item.campaign_id.filter(v => !tempCampaign.includes(v))
            return item;
          })
        }
      }
      return;
    }
    const campaign_ids = [].concat(...selectObj.placement_campaign.map(v => v.campaign_id));

    const toDeleteAppids = selectObj.app_id_blacklist.length === 0 ? []
      : this.appids.filter(v => selectObj.app_id_blacklist.includes(v.app_id)).filter(v => v.category_id == actionId).map(v => v.app_id);

    const toDeleteCampaign = campaign_ids.length === 0 ? []
      : campaign_ids.filter(v => !campaignList.find(m => m.campaign_id == v));

    const categoryName = this.props.optionListDb.Category.find(v => v.id === actionId).name;

    const msg = toDeleteAppids.length > 0 && toDeleteCampaign.length > 0 ? `Confirm to deselect ${categoryName} in Category Whitelist and also delete ${toDeleteAppids.join(', ')} in App ID Blacklist and ${toDeleteCampaign.join(', ')} in Campaign(Placement)?`
      : toDeleteAppids.length > 0 ? `Confirm to deselect ${categoryName} in Category Whitelist and also delete ${toDeleteAppids.join(', ')} in App ID Blacklist?`
        : toDeleteCampaign.length > 0 ? `Confirm to deselect ${categoryName} in Category Whitelist and also delete ${toDeleteCampaign.join(', ')} in Campaign(Placem ent)?`
          : false;

    if (msg === false) return successFn();
    // console.log(toDeleteCampaign)
    Modal.confirm({
      title: msg,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onCancel: () => {
        this.props.form.setFieldsValue({ category_whitelist: this.currentCategory })
      },
      onOk: () => {

        runInAction(() => {
          successFn();
          // debugger
          this.currentAppid = selectObj.app_id_blacklist.filter(v => !toDeleteAppids.includes(v));
          this.props.form.setFieldsValue({
            app_id_blacklist: this.currentAppid,
            placement_campaign: selectObj.placement_campaign.map(v => {
              v.campaign_id = v.campaign_id.filter(m => !toDeleteCampaign.includes(m));
              return v;
            })
          })
        })
      }
    })
  }

  @action
  appidChanged = (value) => {
    // 判断是添加选中 还是取消选中
    const isAdd = this.currentAppid.length < value.length;
    // 操作的category
    const actionId = isAdd ? value.filter(v => !this.currentAppid.includes(v))[0] : this.currentAppid.filter(v => !value.includes(v))[0]
    const campaigns = this.props.optionListDb.AppidCampaign.find(v => v.app_id === actionId).campaign

    if (isAdd === false) {
      this.currentAppid = value;
      this.campaignList = this.campaignList.concat(campaigns);
      return;
    }

    const placement_campaign = this.props.form.getFieldValue('placement_campaign');
    const campaign_ids = [].concat(...placement_campaign.map(v => v.campaign_id));
    const toDeleteCampaign = campaign_ids.filter(v => campaigns.find(m => m.campaign_id == v));
    const successFn = () => {
      this.currentAppid = value;
      this.campaignList = this.campaignList.filter(v => !campaigns.includes(v));
    }
    if (toDeleteCampaign.length === 0) return successFn()

    Modal.confirm({
      title: `Confirm to select ${actionId} in App ID Blacklist but delete ${toDeleteCampaign.map(v => v.campaign_id).join(', ')} in Campaign(Placement) ?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onCancel: () => {
        this.props.form.setFieldsValue({ app_id_blacklist: this.currentAppid })
      },
      onOk: () => {
        this.props.form.setFieldsValue({
          placement_campaign: placement_campaign.map(v => {
            v.campaign_id = v.campaign_id.filter(m => !toDeleteCampaign.includes(m));
            return v;
          })
        })
        runInAction(successFn)
      }
    })

  }

  @action
  pkgNameChanged = (value: number) => {
    this.props.form.setFieldsValue({
      app_id_blacklist: [],
      placement_campaign: []
    })
    if (!value) return this.disabledAll = true;

    this.disabledAll = false;
    const selectPkgname = this.props.optionListDb.PkgNamePlacement.find(v => value == v.id);
    if (!selectPkgname) return;

    const appids = this.props.optionListDb.AppidCampaign.filter(item => item.platform == selectPkgname.platform);

    this.selectPlatformAppids = appids;
    this.appids = this.getAppids(this.currentLimited, this.currentCategory);
    this.placementList = selectPkgname.placement;
    this.campaignList = [].concat(...this.appids.map(v => v.campaign));
    this.blacklist = this.props.pkgNameAndBundleId[selectPkgname.platform]
  }

  /**
   * 获取limite和category约束下的appid带选项
   */
  getAppids = (limited: number, category: number[]) => {
    const appids = (this.selectPlatformAppids || this.props.optionListDb.AppidCampaign);
    return limited === 0
      ? appids
      : appids.filter(v => category.includes(+v.category_id));
  }

  submit = (e?: React.FormEvent<any>): void => {
    if (e) {
      e.preventDefault()
    }
    const { routerStore, create, form, update } = this.props
    form.validateFields(
      async (err, _values): Promise<any> => {
        if (!err) {
          const values = JSON.parse(JSON.stringify(_values))
          // values.placement_campaign = values.placement_campaign.filter(v => v.placement_id);

          if (this.isEdit === false && values.app_id_blacklist.length === 0
            && values.placement_campaign.length === 0
            && (values.limited === 0 || values.category_whitelist.length === 0)) {
            return message.error('Failure! Category Whitelist, App ID Blacklist and Placement-Campaign cannot be empty at the same time.')
          }

          let hasError = false;
          values.placement_campaign.forEach(ele => {
            const {
              placement_id, campaign_id, placement_app_id_list = []
            } = ele
            const hasErr = Number(!!placement_id) === 1 && (0 === Number(!!campaign_id.length) + Number(!!placement_app_id_list.length))
            hasError = hasError || hasErr
          })

          if (hasError) {
            this.childTestChange(true)
            setImmediate(() => {
              this.childTestChange(false)
            })
            return
            // message.error('errorerrorerrorerror')
          }



          this.toggleLoading()
          try {
            // if (Array.isArray(values.pkg_name))
            //   values.pkg_name = values.pkg_name.join(',')

            values.placement_campaign.forEach(ele => {
              delete ele._key_
            })
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

  async componentDidMount() {
    const id = (this.props.match.params as any).id;
    let parr = [
      this.props.getCategory(),
      this.props.getAppidCampaign({ is_edit: !!id })
    ]
    !id && parr.push(this.props.getPkgNamePlacement());

    await Promise.all(parr);

    if (id) {
      await this.getItem(+(this.props.match.params as any).id)
    }
    runInAction(() => {
      this.loaded = true
    })
  }

  componentWillUnmount() {
    this.props.clearItem();
  }
  componentWillMount() {
    this.props.getAllConfig();
  }

  render() {
    const { item, form, optionListDb, pkgNameAndBundleId } = this.props
    const { getFieldDecorator } = form
    return (
      <div className='sb-form'>
        <PortalsBtn querySelector='#IWillUseHelp'>
          <div style={{ textAlign: 'center', color: '#777', height: 30, lineHeight: '30px' }}>
            <Icon type="exclamation-circle" style={{ fontSize: '1.2em', verticalAlign: 'text-bottom', color: '#1890ff', marginRight: '0.5em' }} />
            There is data linkage effect between Category,App ID,Campaign.
         </div>
        </PortalsBtn>
        <Form className={styles.taskModal} >
          <div className={styles.card}>
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
                    getPopupContainer={trigger => trigger.parentElement}
                    onChange={this.pkgNameChanged}
                    // filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    filterOption={(input, option) => (option.props.children as any).props.title.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            <Row style={{ width: 500 }}>
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
                    rules: [{ required: !(this.disabledAll || this.currentLimited === 0), message: "Select at least one Category Whitelist when Limited." }]
                    // rules: [{
                    // validator: (rule, value, cb) => {
                    //   // 编辑模式下不效验
                    //   // limit等于Unlimited时也不效验
                    //   if (this.currentLimited === 0 || this.isEdit) return cb();
                    //   const appid = this.props.form.getFieldValue('app_id_blacklist');
                    //   if (value.length === 0 && !appid) {
                    //     return cb('Failure! Category Whitelist and App ID Blacklist cannot be empty at the same time.')
                    //   }
                    //   if (!appid) {
                    //     this.props.form.validateFields(['app_id_blacklist']);
                    //   }
                    //   cb();
                    // }
                    // }]
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
            <FormItem  {...formItemLayout} wrapperCol={{ ...formItemLayout.wrapperCol, lg: 8 }} label="App ID Blacklist" className={styles.showExtra}>
              {getFieldDecorator('app_id_blacklist', {
                initialValue: item.app_id_blacklist || [],
                // rules: [{
                // validator: (rule, value, cb) => {
                //   // 编辑时 category 和 appid 可以同时为空
                //   if (this.isEdit === false) {
                //     const category = this.props.form.getFieldValue('category_whitelist');
                //     if (!value && category.length === 0) {
                //       return cb('Failure! Category Whitelist and App ID Blacklist cannot be empty at the same time.')
                //     }
                //     if (category.length === 0) {
                //       this.props.form.validateFields(['category_whitelist']);
                //     }
                //   }
                //   cb();
                // }
                // }]
              })(<Select
                mode="multiple"
                className='inlineOption'
                onChange={this.appidChanged}
                disabled={this.disabledAll}>
                {this.appids.map(c => {
                  return <Select.Option key={c.app_id} value={c.app_id} style={c.app_id_status === 'suspend' && { color: '#999' }}>
                    {c.app_id}
                  </Select.Option>
                })}
              </Select>)}
            </FormItem>
          </div>
          <div className={styles.card}>
            <FormItem style={{ width: 'max-content' }}>
              {this.loaded && getFieldDecorator('placement_campaign', {
                initialValue: item.placement_campaign || [],
              })(<PlacementCampaignGroup
                disabled={this.disabledAll}
                form={form}
                blacklist={this.blacklist}
                childTest={this.childTest}
                // onChange={() => this.childTestChange(false)}
                campaignList={this.campaignList}
                placementList={this.placementList} />)}
            </FormItem>
            <FormItem className={styles.btnBox}>
              <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
              <Button style={{ marginLeft: 20 }} onClick={() => this.props.routerStore.push('/whiteBlackList')}>Cancel</Button>
            </FormItem>
          </div>
        </Form>
      </div >
    )
  }
}

export default Form.create<IProps>()(whiteBlackModal)
