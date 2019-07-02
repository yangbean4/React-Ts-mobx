import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, Col, Popover, Icon, Upload, Row } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '@views/AppGroup/web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import MyIcon from '@components/Icon'
import VCmodel from './VCmodel'
import { InitColor } from './Appwall.config'
const FormItem = Form.Item
import InputColor from '@components/InputColor/index'

interface hasResult {
    result?: string
}

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
        const { optionListDb, getVCList, appGroup } = appGroupStore
        return { optionListDb, getVCList, routerStore, appGroup }
    }
)

@observer
class PlacementModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private pidType: number

    @observable
    private VcexRate: number | string

    @observable
    private rewardType: number

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

    @computed
    get usePidtype() {
        const prov = this.props.appGroup && this.props.appGroup.contains_native_s2s_pid_types === 1 ? 5 : undefined
        const value = [this.pidType, this.Palcement.pid_type, prov].find(ele => ele !== undefined)
        return value
    }

    @computed
    get isAdd() {
        return this.props.placementID === undefined
    }

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
        data.reward_type = type !== 1 ? 1 : 2
        this.props.form.setFieldsValue(data)
    }

    @action
    VcChange = (value) => {
        const VcexRate = (this.props.optionListDb.VC.find(ele => ele.id === value) || {}).vc_exchange_rate
        runInAction('VcexRate', () => {
            this.VcexRate = VcexRate
        })
    }

    @action
    rewardTypeChange = (e) => {
        const value = e.target.value
        runInAction('set_STore', () => {
            this.rewardType = value
        })
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
                    this.toggleLoading()
                    try {
                        if (this.isAdd) {
                            await this.api.appGroup.addPalcement({ ...values, dev_app_id: Id })
                        } else {
                            await this.api.appGroup.editPlacement({ ...values, id: placementID })
                        }
                        onOk()
                    } catch (err) {
                        //console.log(err);
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
        }

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
            [`style_detail.${colorKey}`]: typeof andColor === 'boolean' ? InitColor[this.AppWall-1].ad_desc_color : andColor
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

    componentWillMount() {
        if (this.props.Id === this.props.placementID && this.props.placementID === undefined) {
            this.props.routerStore.replace('/apps')
        }
        this.init()
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            status = 1,
            placement_id = '',
            placement_name = "",
            ige_carrier_support = [],
            frequency_num,
            frequency_time,
            creative_type,
            accept_cpm, // 新增
            // pid_type = this.props.appGroup && this.props.appGroup.contains_native_s2s_pid_types === 1 ? 5 : undefined,
            pid_type = this.usePidtype,
            min_offer_num,
            offer_num,
            budget,
            vc_id,
            reward_type,
            reward_num,
            style_id,
            style_detail = {}
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

        const vc_icon = this.imageTarget['vc_icon'] || style_detail['vc_icon']

        return (
            <div className='sb-form'>
                <VCmodel
                    visible={this.VCShow}
                    currency={{
                        platform: this.props.appGroup.platform,
                        app_name: this.props.appGroup.app_name
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
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} />)}
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
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={0} />)}&nbsp;&nbsp;&nbsp;&nbsp;seconds
                    </FormItem>
                    <FormItem label="Lowest eCPM">
                        $&nbsp;{getFieldDecorator('accept_cpm', {
                            initialValue: accept_cpm,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0) {
                                            callback('TheLowest eCPM should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber precision={2} />)}
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
                        })(<InputNumber disabled={this.usePidtype === 1 || this.usePidtype === 3} precision={0} />)}
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
                                        if (v <= 0) {
                                            callback('The Exchange Rate should be a positive integer!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(<InputNumber disabled={this.usePidtype === 1 || this.usePidtype === 3} precision={0} />)}
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
                                            if (v <= 0) {
                                                callback('The Exchange Rate should be a positive integer!')
                                            }
                                            callback()
                                        }
                                    }
                                ]
                            })(<InputNumber precision={0} />)}
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
                                        initialValue: style_detail.subtitle_color || InitColor[this.AppWall-1].subtitle_color,
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
                        this.usePidtype !== 3 && (
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
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                disabled={!this.isAdd && !!vc_id}
                                                onChange={this.VcChange}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {optionListDb.VC.map(c => (
                                                    <Select.Option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    {
                                        (this.isAdd || !vc_id) && <MyIcon className={styles.uploadICON} onClick={() => this.toggleVCShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                                    }
                                </FormItem>
                                <FormItem label="Exchange Rate">
                                    {this.VcexRate} = 1$
                                </FormItem>

                                <FormItem label="Reward Type">
                                    {getFieldDecorator('reward_type', {
                                        initialValue: reward_type,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group
                                            onChange={this.rewardTypeChange}
                                        >
                                            {/* {web.rewardOption.map(c => (
                                                <Radio key={c.key} value={c.value}>
                                                    {c.key}
                                                </Radio>
                                            ))} */}
                                            <Radio disabled={this.usePidtype === 1} value={1}>Dynamic Reward</Radio>
                                            <Radio disabled={this.usePidtype !== undefined && this.usePidtype !== 1} value={2}>Fix Reward</Radio>
                                        </Radio.Group>
                                    )}
                                </FormItem>
                                {
                                    this.usePidtype === 1 && (
                                        <FormItem label="Number Of Reward">
                                            {getFieldDecorator('reward_num', {
                                                initialValue: reward_num,
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
                                            })(<InputNumber precision={0} />)}
                                        </FormItem>
                                    )
                                }

                            </React.Fragment>
                        )
                    }

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(PlacementModal)
