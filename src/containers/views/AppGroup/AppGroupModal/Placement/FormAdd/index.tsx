import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, Col, Popover, Icon, Upload, Row } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '@views/AppGroup/web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import InputColor from '@components/InputColor/index'
import MyIcon from '@components/Icon'
import VCmodel from './VCmodel';
const FormItem = Form.Item
const InitColor = '#FF1D0C';

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
    private AppWall: number

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
        return [this.pidType, !this.Palcement.pid_type, true].find(ele => ele !== undefined)
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
    }

    @action
    VcChange = (value) => {
        const VcexRate = this.props.optionListDb.VC.find(ele => ele.id === value).vc_exchange_rate
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
        this.toggleVCShow(false)
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { form, Id, placementID, onOk } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
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
                this.Palcement = res.data
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
            [`style_detail.${colorKey}`]: InitColor
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
            ige_carrier_block = [],
            frequency_num,
            frequency_time,
            pid_type,
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
                            {img ? <img style={{ width: '100px' }} src={img} /> : <Icon className={styles.workBtn} type='plus' />}
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
                        pkg_name: this.props.appGroup.pkg_name
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
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Placement Name">
                        {getFieldDecorator('placement_name', {
                            initialValue: placement_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="IGE Carrier">
                        {getFieldDecorator('ige_carrier_block',
                            {
                                initialValue: ige_carrier_block,
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
                        })(<InputNumber precision={0} />)}seconds
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
                                    disabled={!this.isAdd}
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
                        })(<InputNumber precision={0} />)}
                    </FormItem>

                    <FormItem label="PID Budget">
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
                    <FormItem {...bigLayout} className={styles.hasImg} label='Select App Wall style'>
                        {getFieldDecorator('style_id', {
                            initialValue: this.usePidtype,
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
                                        <div className={styles.imgBox}><img src={c.url} /></div>
                                        <Radio value={c.id}>
                                            Style{c.id}
                                        </Radio>
                                    </div>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label='Preview picture'>
                        <div className={styles.picture}>
                            <img src={this.useAppWallUrl} />
                        </div>
                    </FormItem>

                    <FormItem label="Title">
                        {getFieldDecorator('style_detail.title_text', {
                            initialValue: style_detail.title_text,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <div className={`${styles.formItemBox} ${styles.noTitle}`}>
                        <FormItem {...noLabelLayout}>
                            {getFieldDecorator('style_detail.title_text_color', {
                                initialValue: style_detail.title_text_color || InitColor,
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
                                initialValue: style_detail.title_background_color || InitColor,
                            })(<InputColor />)}
                            <span className={styles.lineSpan}>   bkgd    or   </span>
                        </FormItem>

                        {getUnpload('title_background_image')}
                    </div>


                    <FormItem label="Subtitle">
                        {getFieldDecorator('style_detail.subtitle_text', {
                            initialValue: style_detail.subtitle_text,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <div className={`${styles.formItemBox} ${styles.noTitle}`}>
                        <FormItem {...noLabelLayout}>
                            {getFieldDecorator('style_detail.subtitle_color', {
                                initialValue: style_detail.subtitle_color || InitColor,
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
                                initialValue: style_detail.subtitle_background_color || InitColor,
                            })(<InputColor />)}
                            <span className={styles.lineSpan}>   bkgd    or   </span>
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
                                    initialValue: style_detail.ad_title_color || InitColor,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   text   </span>
                            </FormItem>
                            <FormItem {...noLabelLayout}>
                                {getFieldDecorator('style_detail.ad_desc_color', {
                                    initialValue: style_detail.ad_desc_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   decr </span>
                            </FormItem>
                        </Col>
                    </Row>

                    <Row className={styles.formItemBox}>
                        <Col span={3} className={styles.boxTitle}>
                            *Ad background
                            </Col>
                        <Col span={15}>
                            <FormItem {...noLabelLayout}>
                                {getFieldDecorator('style_detail.ad_edge_color', {
                                    initialValue: style_detail.ad_edge_color || InitColor,
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
                                    initialValue: style_detail.ad_background_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   bkgd    or   </span>
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
                                    initialValue: style_detail.button_text_color || InitColor,
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
                                    initialValue: style_detail.button_background_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   bkgd </span>
                            </FormItem>
                            <FormItem {...noLabelLayout}>
                                {getFieldDecorator('style_detail.button_edge_color', {
                                    initialValue: style_detail.button_edge_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   edge </span>
                            </FormItem>

                            <FormItem {...noLabelLayout}>
                                {getFieldDecorator('style_detail.button_unavail_color', {
                                    initialValue: style_detail.button_unavail_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>unavail  or</span>
                            </FormItem>
                            {getUnpload('button_background_image')}
                        </Col>
                    </Row>

                    <FormItem label="Icon">
                        {getFieldDecorator('style_detail.vc_icon', {
                            initialValue: style_detail.vc_icon,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Upload {...getProps('vc_icon')}>
                                {vc_icon ? <img style={{ width: '100px' }} src={vc_icon} alt="avatar" /> : <Icon className={styles.workBtn} type='plus' />}
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
                                    initialValue: style_detail.big_background_color || InitColor,
                                })(<InputColor />)}
                                <span className={styles.lineSpan}>   bkgd </span>
                            </FormItem>
                            {getUnpload('big_background_image')}
                        </Col>
                    </Row>

                    {
                        this.pidType !== 3 && (
                            <React.Fragment>
                                <Col span={4} className={styles.companyTag}>
                                    <div className={styles.tagWrapper}>
                                        <span>VC Reward</span>
                                    </div>
                                </Col>
                                <FormItem label="Virtual Currency">
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
                                                disabled={!this.isAdd}
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
                                    <MyIcon className={styles.workBtn} onClick={() => this.toggleVCShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
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
                                            <Radio disabled={this.pidType !== 1} value={1}>Dynamic Reward</Radio>
                                            <Radio disabled={this.pidType === 1} value={2}>Fix Reward</Radio>
                                        </Radio.Group>
                                    )}
                                </FormItem>
                                {
                                    this.pidType === 1 && (
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
