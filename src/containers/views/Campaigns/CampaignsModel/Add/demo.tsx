import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption, adTypeOption, bidTypeOption } from '../../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

const FormItem = Form.Item

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
    optionListDb?: ICampaignStore.OptionListDb
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    campaign?: ICampaignStore.ICampaignGroup
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { campaignStore, routerStore } = store
        const { createCampaingn, modifyCampaingn, optionListDb } = campaignStore
        return { routerStore, createCampaingn, modifyCampaingn, optionListDb }
    }
)
@observer
class CampaignsModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private platform: string = 'android'

    
    @observable
    private campaignTarget :ICampaignStore.ICampaignGroup= {}

    @observable
    private appIDAndroid: any = []

    @observable
    private appIDIOS: any = []

    @observable
    private appIdKey: string = this.campaignTarget.app_key ||''
    

    @computed
    get appTarget(){
        return this.userAppID.find(ele=>ele.app_key === this.appIdKey) || {}
    }



    @computed
    get endcards(){
        return this.appTarget.endcards
    }

    @computed
    get creatives(){
        return this.appTarget.creatives
    }

    @computed
    get isAdd() {
        return !this.props.campaign
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
    AppIdChange = (value)=>{
        this.appIdKey = value
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createCampaingn, form, modifyCampaingn, type, campaign } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {

                        if (this.isAdd) {
                            const {
                                app_name,
                                pkg_name
                            } = this.userAppID.find(ele => ele.id === values.app_name)
                            values = {
                                ...values,
                                app_name
                            }
                            let data = await createCampaingn({ ...values, type: 1 })
                            message.success(data.message)
                            const {
                                platform
                            } = values
                            localStorage.setItem('TargetCurrency', JSON.stringify({
                                app_name,
                                pkg_name,
                                platform
                            }))
                            routerStore.push('/currency/edit')
                        } else {
                            const currencyStr = localStorage.getItem('TargetCurrency') || '{}';
                            const kg = (type ? campaign : JSON.parse(currencyStr)) as ICurrencyStore.ICurrencyForList
                            const {
                                app_name,
                                platform
                            } = kg;
                            // 再Model中新增时需要status的值，在正常添加时用values的值覆盖
                            const pre = { status: 1, ...values, type: 2 }
                            let data
                            if (campaign.id) {
                                data = await modifyCampaingn({
                                    ...pre,
                                    app_name,
                                    platform,
                                    id: campaign.id
                                })
                            } else {
                                data = await createCampaingn({
                                    ...pre,
                                    app_name,
                                    platform,
                                })
                            }
                            message.success(data.message)
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
        /**
         * //TOTO: id ----------------info ------------------------setTarget
         *  */
    }

    @action
    setPlatform = (type) => {
        this.platform = type
    }

    componentWillMount() {
        this.init()
    }

    render() {
        const { campaign, form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            status = 1,
            platform = 'android',
            campaign_name = '',
            target_code = "",
            bid_type = '',
            bid = '',
            total_budget = '',
            daily_budget = '',
            start_time = '',
            end_time = '',
            comment_group_id = '',
            ad_type = '',
            tracking_url = '',
            impression_url = '',
            creative_id = '',
            endcard_id = '',
            default_cpm = '',
            kpi = '',
        } = campaign || {}
        return (
            <div className='sb-form'>
                <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.currencyModal} >
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
                                <Radio.Group>
                                    {statusOption.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>
                    }

                    {
                        this.isAdd && <FormItem label="Platform">
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
                                        onChange={(val) => this.setPlatform(val)}
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                    }

                    {
                        this.isAdd && <FormItem label="App ID">
                            {getFieldDecorator('app_key', {
                                initialValue: campaign_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                onChange={this.AppIdChange}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.userAppID.map(c => (
                                    <Select.Option value={c.app_id_key} key={c.app_id}>
                                        {c.app_id_key}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>
                    }


                    <FormItem label="Campaign Name">
                        {getFieldDecorator('vc_name', {
                            initialValue: target_code,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Target Code"  >
                        {getFieldDecorator('target_code', {
                            initialValue: target_code,
                        })(<Select
                            showSearch
                        >
                
                        </Select>)}
                    </FormItem>

                    <FormItem label="Bid Type">
                        {getFieldDecorator('bid_type', {
                            initialValue: bid_type,
                            validateTrigger: 'blur',
                            rules: [
                                {
                                    required: true, message: "Required",
                                }
                            ]
                        })(<Select
                            showSearch
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                             {platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                        </Select>)}
                    </FormItem>

                    <FormItem label="Bid"  >
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('bid', {
                            initialValue: bid,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<InputNumber />)}
                    </FormItem>

                    <FormItem label="Total Budget">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('total_budget', {
                            initialValue: total_budget,
                        })(<InputNumber />)}
                    </FormItem>

                    <FormItem label="Daily Budget">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('daily_budget', {
                            initialValue: daily_budget,
                        })(<InputNumber />)}
                    </FormItem>

                    <FormItem label="Start Time">
                        {getFieldDecorator('start_time', {
                            initialValue: start_time,
                        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
                    </FormItem>

                    <FormItem label="End Time">
                        {getFieldDecorator('end_time', {
                            initialValue: end_time,
                        })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
                    </FormItem>

                    <FormItem label="Comment Group">
                        {getFieldDecorator('comment_group_id', {
                            initialValue: comment_group_id,
                        })(<Select></Select>)}
                    </FormItem>

                    <FormItem label="Ad Type">
                        {getFieldDecorator('ad_type', {
                            initialValue: ad_type,
                        })(<Select
                            showSearch
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                             {platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                        </Select>)}
                    </FormItem>

                    <FormItem label="Tracking Url">
                        {getFieldDecorator('tracking_url', {
                            initialValue: tracking_url,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem label="Impression Url">
                        {getFieldDecorator('impression_url', {
                            initialValue: impression_url,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem label="Creative">
                        {getFieldDecorator('creative_id', {
                            initialValue: creative_id,
                        })(<Select
                            showSearch
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {
                                this.creatives && this.creatives.map(c=>{
                                    <Select.Option value={c.name} key={c.id}>
                                        {c.name}
                                    </Select.Option>
                                }) 
                            } 
                        </Select>)}
                    </FormItem>

                    <FormItem label="Endcard">
                        {getFieldDecorator('endcard_id', {
                            initialValue: endcard_id,
                        })(<Select
                            showSearch
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {
                                this.endcards && this.endcards.map(c=>{
                                    <Select.Option value={c.name} key={c.id}>
                                        {c.name}
                                    </Select.Option>
                                })  
                            }    
                        </Select>)}
                    </FormItem>

                    <FormItem label="Default cpm">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('default_cpm', {
                            initialValue: default_cpm,
                        })(<InputNumber />)}
                    </FormItem>

                    <FormItem label="Campaign Kpi">
                        {getFieldDecorator('kpi', {
                            initialValue: kpi,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CampaignsModal)
