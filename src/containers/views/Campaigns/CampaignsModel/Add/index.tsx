import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption, adTypeOption, bidTypeOption, trackingTypeOption } from '../../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import moment from 'moment'

const FormItem = Form.Item

const DateFormat = 'YYYY-MM-DD'
const Now = moment().format(DateFormat)
// const IVE = 'IVE'

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 3 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        lg: { span: 5 }
    }
}

const miniLayout = {
    labelCol: {
        lg: { span: 8 }
    },
    wrapperCol: {
        lg: { span: 12 }
    }
}

interface IStoreProps {
    modifyCampaingn?: (campaign: ICampaignStore.ICampaignGroup) => Promise<any>
    createCampaingn?: (campaign: ICampaignStore.ICampaignGroup) => Promise<any>
    getBudgetGroup?: () => void
    optionListDb?: ICampaignStore.OptionListDb
    getTargetCode?: () => Promise<any>
    getCommentsGroupId?: () => Promise<any>
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
    endcards?: string[]
    creatives?: string[]
}
@inject(
    (store: IStore): IProps => {
        const { campaignStore, routerStore } = store
        const { createCampaingn, modifyCampaingn, optionListDb, getTargetCode, getCommentsGroupId, getBudgetGroup } = campaignStore
        return { routerStore, createCampaingn, modifyCampaingn, optionListDb, getTargetCode, getCommentsGroupId, getBudgetGroup }
    }
)

@observer
class CampaignsModal extends ComponentExt<IProps & FormComponentProps> {

    @observable
    private loading: boolean = false

    // @observable
    // private needing: boolean = true

    @observable
    private ID: string = ''


    @observable
    private CampaignGroup: ICampaignStore.ICampaignGroup = {}


    @observable
    private creative_id: string = undefined

    @observable
    private appIDAndroid: any = []

    @observable
    private appIDIOS: any = []

    @observable
    private _appIdKey: string = undefined
    @observable
    private _platform: string = ''

    @observable
    private _bidType: string = ''


    @computed
    get creativeId() {
        return this.creative_id || this.CampaignGroup.creative_id
    }

    @computed
    get needing() {
        // debugger
        const tt = (this.creatives || []).find(ele => ele.id === this.creativeId)
        const is = !(tt && [1, 40, 41].includes(tt.creative_type))
        return is
    }

    @computed
    get platform() {
        return this._platform || this.CampaignGroup.platform || 'android'
    }
    @computed
    get appIdKey() {
        return this._appIdKey || this.CampaignGroup.app_key
    }

    @computed
    get budgetGroupList() {
        return this.props.optionListDb.BudgetGroup.filter(v => v.sen_app_key == this.appIdKey)
    }

    @computed
    get appTarget() {
        return this.userAppID.find(ele => ele.app_key === this.appIdKey) || {}
    }

    @computed
    get endcards() {
        return this.props.endcards || this.appTarget.endcards
    }

    @computed
    get creatives() {
        return this.props.creatives || this.appTarget.creatives
    }

    @computed
    get accountType() {
        return this.appTarget.account_type
    }

    @computed
    get isAdd() {
        return !this.ID
    }

    @computed
    get userAppID() {
        return this.platform === 'android' ? this.appIDAndroid : this.appIDIOS
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    getDetail = async () => {
        const res = await this.api.campaigns.editBeforeCampaigns({ id: this.ID })
        runInAction('SET_APPManage', () => {
            this.CampaignGroup = { ...res.data }
            this.setBidType(res.data.bid_type);
            this.props.form.setFieldsValue({
                status: res.data.status
            })
        })
    }

    @action
    AppIdChange = (value) => {
        this._appIdKey = value
    }

    @action
    limitDecimals = (value: string | number): string => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string') {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number') {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    @action
    selectOption = (value) => {
        runInAction('SET_NEDDING', () => {
            this.creative_id = value
        })
    }

    Cancel = () => {
        (this.props.type || !this.isAdd) && this.props.onCancel ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createCampaingn, form, modifyCampaingn } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    const TargetCampaign = localStorage.getItem('TargetCampaign')
                    const param = JSON.parse(TargetCampaign)
                    const appKey = values.app_key ? values.app_key : param.app_key
                    try {
                        values = {
                            ...values,
                            'start_time': values['start_time'].format(DateFormat),
                            'end_time': values['end_time'] ? values['end_time'].format(DateFormat) : '',
                            'target_code': values.target_code.join(','),
                            'app_key': appKey,

                        }
                        if (values.id === undefined) {
                            let data = await createCampaingn({ ...values })
                            message.success(data.message)
                            routerStore.push('/campaigns')
                        } else {
                            let data = await modifyCampaingn({ ...values })
                            message.success(data.message)
                            routerStore.push('/campaigns')
                            this.props.onOk(data.data.id)
                            if (this.props.type) {
                                this.props.form.resetFields()
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        const res = await this.api.endcard.getappIds()
        runInAction('SET_LIST', () => {
            this.appIDAndroid = res.data.android
            this.appIDIOS = res.data.ios
        })
    }

    @action
    setPlatform = (value) => {
        this._platform = value
    }

    @action
    setBidType = (value) => {
        this._bidType = value;
    }

    @action
    setEndTime = (value) => {
        const initialValue = value ? moment(value) : ''
        this.props.form.setFieldsValue({
            end_time: initialValue
        })
    }

    componentWillMount() {
        this.props.getTargetCode()
        this.props.getCommentsGroupId()
        this.props.getBudgetGroup()
        this.init()
        const {
            routerStore
        } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if (!isNaN(Id)) {
            runInAction('SETID', () => {
                this.ID = routerId
            })
            this.getDetail()
        }
    }
    goBack = () => {
        this.props.history.goBack();
    }

    render() {

        const reData = this.CampaignGroup
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        let target_codeValue: (string | number)[] = []
        const {
            id = '',
            status = 'published',
            platform = 'android',
            app_key = '',
            campaign_name = '',
            target_code = undefined,
            bid_type = 'CPI',
            bid = '',
            s2s_bid = '',
            total_budget,
            daily_budget,
            start_time = Now,
            end_time = '',
            comment_group_id = '',
            ad_type = 1,
            tracking_url = '',
            tracking_url_type = undefined,
            impression_url = '',
            creative_id = '',
            endcard_id = '',
            default_cpm = '0.01',
            kpi = '',
            budget_group = undefined
        } = reData || {}
        if (target_code && reData) {
            target_codeValue = target_code.split(',').map(ele => {
                return (optionListDb.TargetCode.find(code => code.code2 === ele) || {}).code2
            }).filter(ele => ele !== undefined)
        }
        return (
            <div className='sb-form'>
                <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.currencyModal} >
                    {
                        id && <FormItem label="ID">
                            {getFieldDecorator('id', {
                                initialValue: id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Input autoComplete="off" disabled={true} />
                            )}
                        </FormItem>
                    }

                    {
                        !this.props.type && <FormItem label="Status">
                            {getFieldDecorator('status', {
                                initialValue: status,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group disabled={status == 'pending'}>
                                    {statusOption.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>
                    }

                    <FormItem label="Platform">
                        {getFieldDecorator('platform',
                            {
                                initialValue: platform,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    showSearch
                                    disabled={!this.isAdd}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    onChange={(val) => this.setPlatform(val)}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {platformOption.map(c => (
                                        <Select.Option key={c.key} value={c.value}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="App ID">
                        {getFieldDecorator('app_key', {
                            initialValue: app_key,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                disabled={!this.isAdd}
                                getPopupContainer={trigger => trigger.parentElement}
                                onChange={(val) => this.AppIdChange(val)}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.userAppID.map(c => (
                                    <Select.Option value={c.app_key} key={c.app_key}>
                                        {c.app_id_key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Campaign Name">
                        {getFieldDecorator('campaign_name', {
                            initialValue: campaign_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem label="Target Code"  >
                        {getFieldDecorator('target_code', {
                            initialValue: target_codeValue,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                mode="multiple"
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.TargetCode.map(c => (
                                    <Select.Option key={c.id} value={c.code2}>
                                        {c.code2}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Bid Type">
                        {getFieldDecorator('bid_type', {
                            initialValue: bid_type,
                            validateTrigger: 'blur',
                            rules: [
                                {
                                    required: true, message: "Required",
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                onChange={(val) => this.setBidType(val)}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {bidTypeOption.map(c => (
                                    <Select.Option key={c.key} value={c.value}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    {this._bidType == 'CPE' && <FormItem label="S2S Bid"  >
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('s2s_bid', {
                            initialValue: s2s_bid,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive number!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={2} formatter={this.limitDecimals} />)}
                    </FormItem>}

                    <FormItem label="Bid"  >
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('bid', {
                            initialValue: bid,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive number!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={2} formatter={this.limitDecimals} />)}
                    </FormItem>

                    <FormItem label="Total Budget">
                        <span style={{ marginRight: 5 }}>$</span>
                        {getFieldDecorator('total_budget', {
                            initialValue: total_budget,
                            rules: [
                                // {
                                //     required: this.accountType !== 2, message: "Required"
                                // },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0 && v != undefined) {
                                            callback('The Exchange Rate should be a positive number!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={2} formatter={this.limitDecimals} />)}
                    </FormItem>

                    <FormItem label="Daily Budget">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('daily_budget', {
                            initialValue: daily_budget,
                            rules: [
                                {
                                    validator: (r, v, callback) => {
                                        if (v != undefined && v <= 0) {
                                            callback('The Exchange Rate should be a positive number!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={2} formatter={this.limitDecimals} />)}
                    </FormItem>

                    <FormItem label="Budget Group">
                        {getFieldDecorator('budget_group', {
                            initialValue: budget_group
                        })(
                            <Select
                                disabled={!!id || !this.appIdKey}
                                allowClear
                                showSearch
                                maxTagCount={1}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.budgetGroupList.map(c => (
                                    <Select.Option key={c.sen_group_id} value={c.sen_group_id}>
                                        {`${c.group_name}($${c.daily_budget.indexOf('.00') > -1 ? c.daily_budget.slice(0, -3) : c.daily_budget})`}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Start Time">
                        {getFieldDecorator('start_time',
                            {
                                initialValue: moment(start_time),
                                rules: [{ type: 'object', required: true, message: 'Please select time!' }]
                            }
                        )(<DatePicker placeholder="Select Time" />)}
                    </FormItem>

                    <FormItem label="End Time">
                        {getFieldDecorator('end_time',
                            {
                                initialValue: id && end_time ? moment(end_time) : undefined,
                                rules: [{ type: 'object', required: false }],
                            }
                        )(<DatePicker />)}
                    </FormItem>

                    <FormItem label="Comment Group">
                        {getFieldDecorator('comment_group_id', {
                            initialValue: comment_group_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.CommentID.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Ad Type">
                        {getFieldDecorator('ad_type', {
                            initialValue: ad_type,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {adTypeOption.map(c => (
                                    <Select.Option key={c.key} value={c.value}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Tracking Type">
                        {getFieldDecorator('tracking_url_type', {
                            initialValue: tracking_url_type
                        })(
                            <Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {trackingTypeOption.map(c => (
                                    <Select.Option {...c}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Tracking Url">
                        {getFieldDecorator('tracking_url', {
                            initialValue: tracking_url,
                            rules: [
                                {
                                    required: this.accountType !== 2, message: "Required"
                                }
                            ]
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem label="Impression Url">
                        {getFieldDecorator('impression_url', {
                            initialValue: impression_url,
                            rules: [
                                {
                                    required: false, message: "Required"
                                }
                            ]
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem label="Creative">
                        {getFieldDecorator('creative_id', {
                            initialValue: creative_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                onChange={(val) => this.selectOption(val)}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.creatives && this.creatives.filter(c => (!!c.name)).map(c => (
                                    <Select.Option key={c.creative_type} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Endcard">
                        {getFieldDecorator('endcard_id', {
                            initialValue: endcard_id,
                            rules: [
                                {
                                    required: this.needing, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    this.endcards && this.endcards.filter(c => (!!c.name)).map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))
                                }

                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Default cpm">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('default_cpm', {
                            initialValue: default_cpm,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber />)}
                    </FormItem>
                    <FormItem label="Campaign Kpi">
                        {getFieldDecorator('kpi', {
                            initialValue: kpi,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button onClick={this.goBack} style={{ marginLeft: 10 }}>Cancel</Button>
                    </FormItem>
                </Form>

            </div >
        )
    }
}

export default Form.create<IProps>()(CampaignsModal)
