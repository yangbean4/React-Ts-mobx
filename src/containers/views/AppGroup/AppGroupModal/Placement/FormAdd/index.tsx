import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, InputNumber, Col, Popover, Icon, Upload, Row } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '@views/AppGroup/web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import MyIcon from '@components/Icon'
import VCmodel from './VCmodel'
import { InitColor } from './Appwall.config'
const FormItem = Form.Item
import InputColor from '@components/InputColor/index'
let keys_id: number = 0;
interface hasResult {
    result?: string
}
const { Option } = Select
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

const bigLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 3 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        lg: { span: 15 }
    }
}

const noLabelLayout = {
    labelCol: {
        lg: { span: 0 }
    },
    wrapperCol: {
        lg: { span: 24 },
    }
}

interface IStoreProps {
    optionListDb?: IAppGroupStore.OptionListDb
    getVCList?: () => Promise<any>
    getCountry?: () => Promise<any>
    routerStore?: RouterStore
    appGroup?: IAppGroupStore.IAppGroup
}

interface IProps extends IStoreProps {
    Id?: number | string
    placementID?: number
    onCancel?: () => void
    onOk?: (id?: number) => void
}
@inject(
    (store: IStore): IStoreProps => {
        const { appGroupStore, routerStore } = store
        const { optionListDb, getVCList, appGroup, getCountry } = appGroupStore
        return { optionListDb, getVCList, routerStore, appGroup, getCountry }
    }
)

@observer
class PlacementModal extends ComponentExt<IProps & FormComponentProps> {

    @observable
    private vcId: number | string

    @observable
    private loading: boolean = false

    @observable
    private pidType: number

    @observable
    private VCShow: boolean = false

    // @observable
    // private currency: ICurrencyStore.ICurrency

    @observable
    private imageTarget: object = {}

    @observable
    private AppWall: number = 1

    @observable
    private Palcement: IAppGroupStore.Placement = {}


    @computed
    get useAppWall() {
        return [this.AppWall, this.Palcement.style_id, this.props.optionListDb.AppWall[0].id].find(ele => ele !== undefined)
    }
    @computed
    get useAppWallUrl() {
        return this.props.optionListDb.AppWall.find(ele => ele.id === this.useAppWall).url
    }

    @computed
    get usePidtype() {
        const prov = this.props.appGroup && this.props.appGroup.contains_native_s2s_pid_types === 1 ? 5 : undefined
        const value = [this.pidType, this.Palcement.pid_type, prov].find(ele => ele !== undefined)
        return value
    }

    get rewardType() {
        return this.usePidtype === undefined ? this.usePidtype : this.usePidtype !== 1 ? 1 : 2
    }

    @computed
    get isAdd() {
        return this.props.placementID === undefined
    }

    @computed
    get useVcId() {
        return this.vcId || this.Palcement.vc_id
    }

    @computed
    get useVc() {
        return this.props.optionListDb.VC.find(ele => ele.id === this.useVcId) || {}
    }

    @computed
    get useVcList() {
        return this.props.optionListDb.VC.filter(vc => vc.reward_type === this.rewardType)
    }

    @action
    toggleVCShow = (type?: boolean) => {
        const value = type === undefined ? !this.VCShow : type

        runInAction('SHOW', () => {
            this.VCShow = value
        })
    }

    @action
    AppWallCahnge = (e) => {
        this.AppWall = e.target.value
    }

    // @observable
    // private pidTypeList: any[] = []



    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    pidTypeChange = (type) => {
        this.pidType = type;
        let data = {} as IAppGroupStore.Placement
        if (type === 1 || type === 3) {
            data.offer_num = 1;
            data.min_offer_num = 1;
        }
        runInAction('clear_image', () => {
            this.imageTarget = {}
        })
        this.props.form.setFieldsValue(data)
    }

    @action
    VcChange = (value) => {
        this.vcId = value
    }

    Cancel = () => {
        this.props.onCancel()
    }

    VCModelOk = async (id: number) => {
        await this.props.getVCList()
        this.props.form.setFieldsValue({// 重新赋值
            vc_id: id
        })
        this.VcChange(id)
        this.toggleVCShow(false)
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { form, Id, placementID, onOk } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                values = { ...values, ige_carrier_support: values.ige_carrier_support.join(',') }
                if (!err) {
                    try {
                        values.campaign_filter = values.campaign_filter.filter(v => v.geo || v.profit)
                        console.log(values.campaign_filter)
                        for (let i in values.campaign_filter) {
                            if ((values.campaign_filter[i].geo && values.campaign_filter[i].profit == '') || (values.campaign_filter[i].profit != '' && !values.campaign_filter[i].geo)) {
                                this.$message.error('Please check the geo and profit options')
                                return
                            }
                        }
                        this.toggleLoading()
                        if (this.isAdd) {
                            await this.api.appGroup.addPalcement({ ...values, dev_app_id: Id })
                        } else {
                            await this.api.appGroup.editPlacement({ ...values, id: placementID })
                        }
                        onOk()
                    } catch (err) {
                        console.log(err)
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        const id = this.props.placementID
        if (id !== undefined) {
            const res = await this.api.appGroup.palcementDetail({ id })
            runInAction('set_p', () => {
                this.Palcement = {
                    ...res.data,
                    ige_carrier_support: res.data.ige_carrier_support.split(',')
                }

            })
            keys_id = Number(res.data.campaign_filter.length)
        }

        this.props.getCountry();

        // const pidRes = await this.api.appGroup.getPidType()
        // runInAction('set_List', () => {
        //     this.pidTypeList = pidRes.data;
        // })
    }

    @action
    removeFile = (key, andColor?) => {
        runInAction('SET_URL', () => {
            this.imageTarget[key] = ''
        })
        const colorKey = key.replace('image', 'color')
        const data = andColor ? {
            [`style_detail.${key}`]: '',
            [`style_detail.${colorKey}`]: typeof andColor === 'boolean' ? InitColor[this.AppWall - 1].ad_desc_color : andColor
        } : {
                [`style_detail.${key}`]: '',
            }
        this.props.form.setFieldsValue(data)
    }


    @action
    addFile = (key, localUrl, url, andColor?) => {
        runInAction('SET_URL', () => {
            this.imageTarget[key] = localUrl
        })
        const colorKey = key.replace('image', 'color')

        const data = andColor ? {
            [`style_detail.${key}`]: url,
            [`style_detail.${colorKey}`]: ''
        } : {
                [`style_detail.${key}`]: url,
            }

        this.props.form.setFieldsValue(data)
    }

    // @action
    // clearCampaignFilter = () => {
    //     this.Palcement.campaign_filter = []
    // }
    removeCam = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        const index = keys.findIndex(key => key === k);
        if (keys.length === 1) {
            // const nextKeys = [...keys]
            // nextKeys.splice(index + 1, 0, ++keys_id)
            // // debugger;
            // form.setFieldsValue({
            //     keys: nextKeys,
            // });
            form.setFieldsValue({
                [`campaign_filter[${k}].geo`]: '',
                [`campaign_filter[${k}].profit`]: '',
                [`campaign_filter[${k}].id`]: ''
            });
            // this.Palcement.campaign_filter = []
            return;
        }
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });

    }

    addCam = (k) => {
        const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const index = keys.findIndex(key => key === k);
        const nextKeys = [...keys]
        nextKeys.splice(index + 1, 0, ++keys_id)
        // debugger;
        form.setFieldsValue({
            keys: nextKeys,
        });
    }

    componentWillMount() {
        if (this.props.Id === this.props.placementID && this.props.placementID === undefined) {
            this.props.routerStore.replace('/apps')
        }
        this.init()
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator, getFieldValue } = form
        const {
            status = 1,
            placement_id = '',
            placement_name = "",
            ige_carrier_support = [],
            frequency_num,
            frequency_time,
            offer_rate,
            creative_type,
            accept_ecpm, // 新增
            // pid_type = this.props.appGroup && this.props.appGroup.contains_native_s2s_pid_types === 1 ? 5 : undefined,
            pid_type = this.usePidtype,
            min_offer_num,
            offer_num,
            budget,
            vc_id,
            style_id,
            style_detail = {},
            campaign_filter = [{
                geo: '',
                profit: '',
                id: ''
            }]
        } = this.Palcement

        const getProps = (key, andColor?) => ({
            showUploadList: false,
            accept: ".png, .jpg, .jpeg, .gif",
            name: 'file',
            // listType: "picture",
            className: "avatar-uploader",
            onRemove: () => this.removeFile(key, andColor),
            customRequest: (data) => {
                const formData = new FormData()
                formData.append('file', data.file)
                this.api.appGroup.uploadIcon(formData).then(res => {
                    const logo = res.data.url
                    const fileRender = new FileReader()
                    fileRender.onload = (ev) => {
                        const target = ev.target as hasResult
                        this.addFile(key, target.result, logo, andColor)
                    }
                    fileRender.readAsDataURL(data.file)
                }, this.removeFile).catch(this.removeFile)
            }
        })
        const getUnpload = (key) => {
            const props = getProps(key, true)

            const img = this.imageTarget[key] || style_detail[key]

            return (
                <FormItem {...noLabelLayout}>
                    {getFieldDecorator(`style_detail.${key}`, {
                        initialValue: style_detail[key],
                    })(
                        <Upload {...props}>
                            {img ? <img style={{ width: '100px' }} src={img} />
                                : <Button className={styles.uploadBtn}>
                                    <Icon className={styles.colorFont} type='upload' /><span className={styles.text}>Upload Image</span>
                                </Button>
                            }
                        </Upload>
                    )}
                </FormItem>
            )
        }

        const vc_icon = this.imageTarget['vc_icon'] || style_detail['vc_icon'];
        console.log(campaign_filter && campaign_filter.length > 0 ? Object.keys(campaign_filter) : [0])
        getFieldDecorator('keys', { initialValue: campaign_filter && campaign_filter.length > 0 ? Object.keys(campaign_filter) : [0] });
        const keys = getFieldValue('keys');
        const CampaignItems = keys.map((k) => (
            <div key={k} className={`${styles.campaignFilter} ${styles.item}`} >
                <div>
                    <Form.Item {...formItemLayout} style={{ display: 'inline-block', marginTop: 10 }}>
                        {getFieldDecorator(`campaign_filter[${k}].geo`, {
                            initialValue: campaign_filter[k] ? campaign_filter[k].geo : '',
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: false,
                                    whitespace: true,
                                    message: "require",
                                },
                            ],
                        })(<Select
                            showSearch
                            placeholder="" style={{ width: 100 }}
                        >
                            {this.props.optionListDb.Country.map(v => (
                                <Option key={v.id} value={v.code2}>{v.code2}</Option>
                            ))}
                        </Select>)}
                    </Form.Item>
                </div>
                <div>
                    <Form.Item style={{ display: 'inline-block', marginTop: 10 }}>
                        {getFieldDecorator(`campaign_filter[${k}].profit`, {
                            initialValue: campaign_filter[k] ? campaign_filter[k].profit : '',
                            // validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: false,
                                    message: "require",
                                },
                                {
                                    validator: (r, v, callback) => {
                                        callback(v < -100 ? 'Profit Rate no less than -100%' : undefined)
                                    }
                                }
                            ],
                        })(<InputNumber placeholder="" autoComplete="off" min={-100} style={{ width: 170 }} />)}
                        &nbsp;%
                    </Form.Item>
                </div>
                <div style={{ display: 'none' }}>
                    <Form.Item >
                        {getFieldDecorator(`campaign_filter[${k}].id`, {
                            initialValue: campaign_filter[k] ? campaign_filter[k].id : '',
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: false,
                                    message: "require",
                                },
                            ],
                        })(<Input type='number' placeholder="" autoComplete="off" />)}
                    </Form.Item>
                </div>
                <div>
                    <Icon style={{ margin: 5 }}
                        className="dynamic-delete-button"
                        type="plus-circle"
                        onClick={() => this.addCam(k)}
                    />
                    {<Icon
                        className="dynamic-add-button"
                        type="minus-circle-o"
                        onClick={() => this.removeCam(k)}
                    />}
                </div>
            </div>
        ))

        return (
            <div className='sb-form'>
                <VCmodel
                    visible={this.VCShow}
                    currency={{
                        platform: this.props.appGroup.platform,
                        app_name: this.props.appGroup.app_name,
                        reward_type: this.rewardType
                    }}
                    onOk={this.VCModelOk}
                    onCancel={() => this.toggleVCShow(false)}
                />
                <Form {...formItemLayout} className={styles.currencyModal} >
                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>Basic Info</span>
                        </div>
                    </Col>
                    <FormItem label="Status">
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.statusOption.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                        <Popover content={(<p>Adjust to Enable status, may reduce revenue.</p>)}>
                            <Icon className={styles.workBtn} type="question-circle" />
                        </Popover>
                    </FormItem>
                    <FormItem label="PID">
                        {getFieldDecorator('placement_id', {
                            initialValue: placement_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.isAdd} />)}
                    </FormItem>

                    <FormItem label="Placement Name">
                        {getFieldDecorator('placement_name', {
                            initialValue: placement_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem label="IGE Carrier">
                        {getFieldDecorator('ige_carrier_support',
                            {
                                initialValue: ige_carrier_support,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    mode="multiple"
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {web.IGE.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        <Popover content={(<p>Support the network type of ige offer.</p>)}>
                            <Icon className={styles.workBtn} type="question-circle" />
                        </Popover>
                    </FormItem>
                    <FormItem label="Apply Creative Type">
                        {getFieldDecorator('creative_type',
                            {
                                initialValue: creative_type,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    mode="multiple"
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {web.creative_type.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>

                    <FormItem label="Frequency Number">
                        {getFieldDecorator('frequency_num', {
                            initialValue: frequency_num,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v < 0) {
                                            callback('The frequency number is a non-negative integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} min={0} max={1000} />)}
                    </FormItem>
                    <FormItem label="Frequency Time">
                        {getFieldDecorator('frequency_time', {
                            initialValue: frequency_time,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v < 0) {
                                            callback('The frequency time is a non-negative integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} min={0} max={100000} />)}&nbsp;&nbsp;&nbsp;&nbsp;seconds
                    </FormItem>

                    <FormItem label="Lowest eCPM">
                        $&nbsp;{getFieldDecorator('accept_ecpm', {
                            initialValue: accept_ecpm,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v < 0) {
                                            callback('The Lowest eCPM cannot be negative number!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} min={0} max={1000} />)}
                    </FormItem>

                    <FormItem label="Offer Rate">
                        {getFieldDecorator('offer_rate', {
                            initialValue: offer_rate,
                            rules: [
                                {
                                    required: false, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {

                                        if (v < 0 || v > 100) {
                                            callback('The offer rate should be filled with an integer value of 0 - 100')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} min={0} max={100} />)}&nbsp;&nbsp;&nbsp;&nbsp;%
                    </FormItem>
                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>PID Type</span>
                        </div>
                    </Col>

                    <FormItem label="PID Type">
                        {getFieldDecorator('pid_type',
                            {
                                initialValue: pid_type,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    disabled={!this.isAdd || this.props.appGroup && this.props.appGroup.contains_native_s2s_pid_types === 1}
                                    onChange={this.pidTypeChange}
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.PidType.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>

                    <FormItem label="Offer Number">
                        {getFieldDecorator('offer_num', {
                            initialValue: offer_num,
                            rules: [
                                {
                                    required: true, message: 'Required'
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v < 0) {
                                            callback('The offer number is a non-negative integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber disabled={this.usePidtype === 1 || this.usePidtype === 3}
                            precision={0} min={0} max={1000} />)}
                    </FormItem>

                    <FormItem label="Mini Offer Number">
                        {getFieldDecorator('min_offer_num', {
                            initialValue: min_offer_num,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v < 0) {
                                            callback('The mini offer number is a non-negative integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber disabled={this.usePidtype === 1 || this.usePidtype === 3}
                            precision={0} min={0} max={1000} />)}
                    </FormItem>

                    {
                        (this.usePidtype === 2 || this.usePidtype === 5) && <FormItem label="PID Budget">
                            {getFieldDecorator('budget', {
                                initialValue: budget,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    },
                                    {
                                        validator: (r, v, callback) => {
                                            if (v < 0) {
                                                callback('The pid budget is a non-negative integer!')
                                            }
                                            callback()
                                        }
                                    }
                                ]
                            })(<InputNumber precision={0} min={0} max={100000} />)}
                            $
                            <Popover content={(<p>Support the network type of ige offer.</p>)}>
                                <Icon className={styles.workBtn} type="question-circle" />
                            </Popover>
                        </FormItem>
                    }
                    {
                        this.usePidtype === 2 && <React.Fragment>
                            <FormItem {...bigLayout} className={styles.hasImg} label='Select App Wall style'>
                                {getFieldDecorator('style_id', {
                                    initialValue: style_id,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Radio.Group
                                        onChange={this.AppWallCahnge}
                                    >
                                        {optionListDb.AppWall.map(c => (
                                            <div className={styles.GroupBox} key={c.id}>
                                                <div className={styles.imgBox} style={{ backgroundImage: 'url(' + c.url + ')' }}></div>
                                                <Radio value={c.id}>
                                                    Style{c.id}
                                                </Radio>
                                            </div>
                                        ))}
                                    </Radio.Group>
                                )}
                            </FormItem>
                            <FormItem label='Preview picture'>
                                <div className={styles.picture} style={{ backgroundImage: 'url(' + this.useAppWallUrl + ')' }}></div>
                            </FormItem>

                            <FormItem label="Title">
                                {getFieldDecorator('style_detail.title_text', {
                                    initialValue: style_detail.title_text || InitColor[this.AppWall - 1].title_text,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Input autoComplete="off" />)}
                            </FormItem>
                            <div className={`${styles.formItemBox} ${styles.noTitle}`}>

                                {/* <FormItem {...noLabelLayout}>
                                    {getFieldDecorator('style_detail.title_font', {
                                        initialValue: style_detail.title_font,
                                    })(<Input autoComplete="off" style={{ width: '60%' }} />)}
                                    <span className={styles.lineSpan}>   font   </span>
                                </FormItem> */}
                                <FormItem {...noLabelLayout}>title_text_color
                                    {getFieldDecorator('style_detail.title_text_color', {
                                    initialValue: style_detail.title_text_color || InitColor[this.AppWall - 1].title_text_color,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<InputColor />)}
                                    <span className={styles.lineSpan}>   text   </span>
                                </FormItem>
                                <FormItem {...noLabelLayout}>
                                    {getFieldDecorator('style_detail.title_background_color', {
                                        initialValue: style_detail.title_background_color || InitColor[this.AppWall - 1].title_background_color,
                                    })(<InputColor onChange={(color) => this.removeFile("title_background_image", color)} />)}
                                    <span className={styles.lineSpanOr}>bkgd&nbsp;&nbsp;&nbsp;&nbsp;or</span>
                                </FormItem>

                                {getUnpload('title_background_image')}
                            </div>


                            <FormItem label="Subtitle">
                                {getFieldDecorator('style_detail.subtitle_text', {
                                    initialValue: style_detail.subtitle_text || InitColor[this.AppWall - 1].subtitle_text,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Input autoComplete="off" />)}
                            </FormItem>

                            <div className={`${styles.formItemBox} ${styles.noTitle}`}>
                                <FormItem {...noLabelLayout}>
                                    {getFieldDecorator('style_detail.subtitle_color', {
                                        initialValue: style_detail.subtitle_color || InitColor[this.AppWall - 1].subtitle_color,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<InputColor />)}
                                    <span className={styles.lineSpan}>   text   </span>
                                </FormItem>
                                <FormItem {...noLabelLayout}>
                                    {getFieldDecorator('style_detail.subtitle_background_color', {
                                        initialValue: style_detail.subtitle_background_color || InitColor[this.AppWall - 1].subtitle_background_color,
                                    })(<InputColor onChange={(color) => this.removeFile("subtitle_background_image", color)} />)}
                                    <span className={styles.lineSpanOr}>bkgd&nbsp;&nbsp;&nbsp;&nbsp;or</span>
                                </FormItem>
                                {getUnpload('subtitle_background_image')}
                            </div>


                            <Row className={styles.formItemBox}>
                                <Col span={3} className={styles.boxTitle}>
                                    *Ad text
                                </Col>
                                <Col span={15}>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.ad_title_color', {
                                            initialValue: style_detail.ad_title_color || InitColor[this.AppWall - 1].ad_title_color,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   title   </span>
                                    </FormItem>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.ad_desc_color', {
                                            initialValue: style_detail.ad_desc_color || InitColor[this.AppWall - 1].ad_desc_color,
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   decr </span>
                                    </FormItem>
                                    {/* <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.ad_edge_color', {
                                            initialValue: style_detail.ad_edge_color || InitColor,
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   edge </span>
                                    </FormItem> */}
                                </Col>
                            </Row>

                            <Row className={styles.formItemBox}>
                                <Col span={3} className={styles.boxTitle}>
                                    *Ad background
                                </Col>
                                <Col span={15}>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.ad_edge_color', {
                                            initialValue: style_detail.ad_edge_color || InitColor[this.AppWall - 1].ad_edge_color,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   edge   </span>
                                    </FormItem>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.ad_background_color', {
                                            initialValue: style_detail.ad_background_color || InitColor[this.AppWall - 1].ad_background_color,
                                        })(<InputColor onChange={(color) => this.removeFile("ad_background_image", color)} />)}
                                        <span className={styles.lineSpanOr}>bkgd&nbsp;&nbsp;&nbsp;&nbsp;or</span>
                                    </FormItem>
                                    {getUnpload('ad_background_image')}
                                </Col>
                            </Row>


                            <Row className={styles.formItemBox}>
                                <Col span={3} className={styles.boxTitle}>
                                    *button
                            </Col>
                                <Col span={15}>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.button_text_color', {
                                            initialValue: style_detail.button_text_color || InitColor[this.AppWall - 1].button_text_color,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   text   </span>
                                    </FormItem>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.button_background_color', {
                                            initialValue: style_detail.button_background_color || InitColor[this.AppWall - 1].button_background_color,
                                        })(<InputColor onChange={(color) => this.removeFile("button_background_image", color)} />)}
                                        <span className={styles.lineSpan}>   bkgd </span>
                                    </FormItem>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.button_edge_color', {
                                            initialValue: style_detail.button_edge_color || InitColor[this.AppWall - 1].button_edge_color,
                                        })(<InputColor />)}
                                        <span className={styles.lineSpan}>   edge </span>
                                    </FormItem>

                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.button_unavail_color', {
                                            initialValue: style_detail.button_unavail_color || InitColor[this.AppWall - 1].button_unavail_color,
                                        })(<InputColor />)}
                                        <span className={styles.lineSpanOr}>unavail&nbsp;&nbsp;&nbsp;&nbsp;or</span>
                                    </FormItem>
                                    {getUnpload('button_background_image')}
                                </Col>
                            </Row>

                            <FormItem label="VC Icon">
                                {getFieldDecorator('style_detail.vc_icon', {
                                    initialValue: style_detail.vc_icon,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Upload {...getProps('vc_icon')}>
                                        {
                                            vc_icon ? <img style={{ width: '100px' }} src={vc_icon} alt="avatar" />
                                                : <Button className={styles.uploadBtn}>
                                                    <Icon className={styles.colorFont} type='upload' />
                                                    <span className={styles.text}>Upload</span>
                                                </Button>
                                        }
                                    </Upload>
                                )}
                            </FormItem>


                            <Row className={styles.formItemBox}>
                                <Col span={3} className={styles.boxTitle}>
                                    *Big Background
                            </Col>
                                <Col span={15}>
                                    <FormItem {...noLabelLayout}>
                                        {getFieldDecorator('style_detail.big_background_color', {
                                            initialValue: style_detail.big_background_color || InitColor[this.AppWall - 1].big_background_color,
                                        })(<InputColor onChange={(color) => this.removeFile("big_background_image", color)} />)}
                                        <span className={styles.lineSpan}>   bkgd </span>
                                    </FormItem>
                                    {getUnpload('big_background_image')}
                                </Col>
                            </Row>

                            {/* <FormItem label='Content Font'>
                                {getFieldDecorator('style_detail.content_font', {
                                    initialValue: style_detail.content_font,
                                })(<Input autoComplete="off" />)}
                            </FormItem> */}
                        </React.Fragment>
                    }

                    {
                        [3, 6].includes(this.usePidtype) == false && (
                            <React.Fragment>
                                <Col span={4} className={styles.companyTag}>
                                    <div className={styles.tagWrapper}>
                                        <span>VC Reward</span>
                                    </div>
                                </Col>
                                <FormItem label="Virtual Currency" className={styles.vcId}>
                                    {getFieldDecorator('vc_id',
                                        {
                                            initialValue: vc_id,
                                            rules: [
                                                {
                                                    required: this.usePidtype === 2, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                getPopupContainer={trigger => trigger.parentElement}
                                                disabled={!this.isAdd && !!vc_id}
                                                onChange={this.VcChange}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {this.useVcList.map(c => (
                                                    <Select.Option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    {
                                        (this.isAdd || !vc_id) && this.rewardType && <MyIcon className={styles.uploadICON} onClick={() => this.toggleVCShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                                    }
                                </FormItem>

                                <FormItem label="Reward Type">

                                    <Radio.Group
                                        value={this.rewardType}
                                        disabled={true}
                                    >
                                        <Radio value={1}>Dynamic Reward</Radio>
                                        <Radio value={2}>Fix Reward</Radio>
                                    </Radio.Group>
                                </FormItem>
                                {
                                    this.rewardType === 1 ? <FormItem label="Exchange Rate">
                                        {this.useVc.vc_exchange_rate} = 1$
                                </FormItem> : <FormItem label="Number Of Reward">
                                            {this.useVc.reward_num}
                                        </FormItem>
                                }



                                {/* {
                                    this.usePidtype === 1 && (
                                        <FormItem label="Number Of Reward">
                                            {getFieldDecorator('reward_num', {
                                                initialValue: reward_num,
                                                rules: [
                                                    {
                                                        validator: (r, v, callback) => {
                                                            if (v <= 0) {
                                                                callback('The Exchange Rate should be a positive integer!')
                                                            }
                                                            callback()
                                                        }
                                                    }
                                                ]
                                            })(<InputNumber precision={0} />)}
                                        </FormItem>
                                    )
                                } */}

                            </React.Fragment>
                        )
                    }

                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>Campaign Filter</span>
                        </div>
                    </Col>
                    <div className={styles.campaignFilterWrap}>
                        <div className={styles.campaignFilter}>
                            <div>GEO</div>
                            <div>Profit Rate
                                <Popover content={(<p>The minimum Profit Rate can be -100%</p>)}>
                                    <Icon className={styles.workBtn} type="question-circle" />
                                </Popover>
                            </div>
                            <div>Operate</div>
                        </div>
                        {CampaignItems}
                    </div>


                    <FormItem className={styles.btnBox} style={{ marginTop: 10 }}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(PlacementModal)
