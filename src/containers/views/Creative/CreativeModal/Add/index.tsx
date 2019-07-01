import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Icon, InputNumber, Row, Col, Modal } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { YesOrNo, videoType, descriptionOption, skipToOption, igeFlag, igeOption, igeScene, igePrefailOption } from '../../config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { typeOf } from '@utils/index'
import UploadFile, { UploadFileProps, FileWHT } from '@components/UploadFile'
import AccountModel from './AccountModel'
import MyIcon from '@components/Icon'

const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 5 }
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

const miniLayout = {
    labelCol: {
        lg: { span: 8 }
    },
    wrapperCol: {
        lg: { span: 12 }
    }
}

interface IStoreProps {
    modifyCreative?: (creative: ICreativeStore.ICreative) => Promise<any>
    createCreative?: (creative: ICreativeStore.ICreative) => Promise<any>
    routerStore?: RouterStore
    getOptionListDb?: () => Promise<any>
    getContentList?: () => Promise<any>
    optionListDb?: ICreativeStore.OptionListDb
}

interface IProps extends IStoreProps {
    creativeId?: number
    creative?: ICreativeStore.ICreative
    app_key?: string
    platform?: string
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { creativeStore, routerStore } = store
        const { createCreative, modifyCreative, getOptionListDb, optionListDb, getContentList } = creativeStore
        return { routerStore, createCreative, modifyCreative, getOptionListDb, optionListDb, getContentList }
    }
)
@observer
class CreativeModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private imageTarget: object = {}

    private confirmModal

    @observable
    private creativeTarget: ICreativeStore.ICreative = {}

    @observable
    private platform: string = this.props.platform || this.creativeTarget.platform || 'android'

    @observable
    private app_key: string = this.props.app_key || this.creativeTarget.app_key || undefined

    @observable
    private skipTo: string

    @observable
    private needLC: number

    @observable
    private CreativeType: number

    @observable
    private playback_time: number = this.creativeTarget.playback_time || 30

    @observable
    private videoTypeValue: number

    @observable
    private igeFlag: number

    @observable
    private accountShow: boolean = false

    @computed
    get useNeedLc() {
        return [this.needLC, this.creativeTarget.lead_is_show_content, 1].find(ele => ele !== undefined)
    }

    @computed
    get useVideoTypeValue() {
        return [this.videoTypeValue, this.creativeTarget.video_type, 1].find(ele => ele !== undefined)
    }

    @computed
    get useSkipTo() {
        return [this.skipTo, this.creativeTarget.skip_to, 'ige'].find(ele => ele !== undefined)
    }

    @computed
    get useIgeFlag() {
        return [this.igeFlag, this.creativeTarget.ige_leadvideo_flag, 2].find(ele => ele !== undefined)
    }

    @computed
    get useCreativeType() {
        return [this.CreativeType, this.creativeTarget.creative_type, 3].find(ele => ele !== undefined)
    }

    @computed
    get useContentList() {
        return this.props.optionListDb.LeadContents[this.app_key] || []
    }

    @computed
    get appTarget() {
        return this.usePkgnameData.find(ele => ele.app_key === this.app_key) || {}
    }

    @computed
    get appId() {
        return this.appTarget.app_id
    }
    @computed
    get appName() {
        return this.appTarget.app_name
    }

    @computed
    get videoType() {
        return videoType.find(ele => ele.value === this.useVideoTypeValue).key
    }

    @computed
    get descriptionOption() {
        return descriptionOption
    }

    @computed
    get appwall_description() {
        return this.useCreativeType === 2 ? 'Watch the video' : `Play for ${this.playback_time}s`
    }

    @computed
    get isAdd() {
        return !this.props.creativeId
    }


    @computed
    get usePkgnameData() {
        return this.props.optionListDb.appIds[this.platform]
    }

    @action
    toggleAppShow = (type?: boolean) => {
        this.accountShow = type === undefined ? !this.accountShow : type
    }

    companyModelOk = async (id: number) => {
        await this.props.getContentList()
        this.props.form.setFieldsValue({// 重新赋值
            lead_content_id: id
        })
        this.toggleAppShow(false)
    }

    @action
    setCreativeType = (value) => {
        this.CreativeType = value
        this.removeFile(
            Object.keys(this.imageTarget).filter(ele => ele !== 'creative_icon_url')
        )
    }

    @action
    playback_timeChange = (value) => {
        this.playback_time = value
    }

    @action
    skipToChange = (e) => {
        this.skipTo = e.target.value
    }
    @action
    setNeedLC = (e) => {
        this.needLC = e.target.value
    }

    @action
    setVideoType = (value) => {
        this.videoTypeValue = value
    }

    @action
    setIgeFlag = (value) => {
        this.igeFlag = value
    }

    languageChange = (language) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id'])
        this.props.form.setFieldsValue({
            creative_name: `${this.appName}_${data.order_id}_${data.version}_${language}`
        })
    }
    order_idChange = (order_id) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            creative_name: `${this.appName}_${order_id.target.value}_${data.version}_${data.language}`
        })
    }

    versionChange = (version) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            creative_name: `${this.appName}_${data.order_id}_${version.target.value}_${data.language}`
        })
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/creative')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createCreative, form, modifyCreative, creativeId, creative, app_key } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        if (this.useCreativeType === 3) {
                            const {
                                ige_portrait_offline_url = '',
                                ige_landscape_offline_url = '',
                                ige_portrait_video_cover_url = '',
                                ige_landscape_video_cover_url = '',
                            } = values
                            console.log(values)
                            if (
                                (!ige_portrait_video_cover_url && !ige_landscape_video_cover_url) ||
                                (ige_portrait_offline_url && !ige_portrait_video_cover_url) ||
                                (ige_landscape_offline_url && !ige_landscape_video_cover_url)
                            ) {
                                const error = 'Please upload the landscape cover image./Please upload the portrait cover image.'
                                message.error(error)
                                throw new Error(error)
                            }
                        }
                        if (this.useCreativeType === 4) {
                            values = {
                                ...values,
                                creative_type: this.useCreativeType * 10 + (this.useSkipTo === 'ige' ? 0 : 1)
                            }
                        }
                        if (this.useCreativeType === 2 || this.useCreativeType === 3) {
                            values = {
                                ...values,
                                desc: this.appwall_description
                            }
                        }

                        if (this.isAdd) {
                            if (app_key) {
                                values = {
                                    app_key,
                                    ...values,
                                }
                            } else {
                                localStorage.setItem('TargetCreative', JSON.stringify(
                                    {
                                        app_id: this.appId,
                                        platform: values.platform
                                    }
                                ))
                            }
                            let data = await createCreative(values)
                            message.success(data.message)
                            creative ? this.props.onOk(data.data.id) : routerStore.push(`/creative/edit/${data.data.app_key || app_key || values.app_key}`)
                        } else {
                            const cb = async () => {
                                const data = await modifyCreative({
                                    ...this.creativeTarget,
                                    ...values,
                                    id: creativeId
                                })
                                message.success(data.message)
                                this.props.onOk(data.data.id)
                            }
                            if ((this.creativeTarget.status !== values.status) && values.status === 0) {
                                this.api.creative.checkCreative({ id: creativeId }).then((res) => {
                                    if (res.data.errorcode !== 0) {

                                        message.error(`${values.creative_name} is in use. Please remove the corresponding relation before deleting it！`)
                                        // this.confirmModal = Modal.confirm({
                                        //     // okText: 'Yes',
                                        //     cancelText: 'Ok',
                                        //     content: ,
                                        //     onCancel: () => {
                                        //         setImmediate(() => {
                                        //             this.confirmModal.destroy()
                                        //         })
                                        //     },
                                        //     onOk: () => {
                                        //         setImmediate(() => {
                                        //             this.confirmModal.destroy()
                                        //         })
                                        //     }
                                        // })
                                    } else {
                                        cb()
                                    }
                                })
                            } else {
                                cb()
                            }

                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                } else {
                    console.log(this.useCreativeType === 4 ? Number(this.useCreativeType) * 10 + (this.useSkipTo === 'ige' ? 0 : 1) : this.useCreativeType)
                }
            }
        )
    }


    @action
    setPlatform = (type) => {
        this.platform = type
        this.removeFile()
        this.props.form.setFieldsValue({
            app_key: ''
        })
    }

    @action
    setAppid = (app_key) => {
        const appName = this.usePkgnameData.find(ele => ele.app_key === app_key).app_name
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            creative_name: `${appName}_${data.order_id}_${data.version}_${data.language}`
        })
        runInAction('set_key', () => {
            this.app_key = app_key
        })
        this.removeFile()
    }

    @action
    removeFile = (key?) => {
        let keys = key ? (typeOf(key) === 'string' ? [key] : key) : Object.keys(this.imageTarget)
        let data = {}
        keys.forEach(ele => {
            data[ele] = ''
        })

        this.props.form.setFieldsValue({
            ...data
        })
        runInAction('clear_Image', () => {
            this.imageTarget = {
                ...this.imageTarget,
                ...data
            }
        })
    }

    @action
    getDetail = async () => {
        const res = await this.api.creative.getCreativeInfo({ id: this.props.creativeId })
        let data = { ...res.data }
        if (data.creative_type === 40 || data.creative_type === 41) {
            data = {
                ...data,
                creative_type: 4,
                skip_to: data.creative_type === 40 ? 'ige' : 'gp'
            }
        }
        runInAction('SET_APPGroup', () => {
            this.creativeTarget = data
        })
    }

    /**
     * fun 上传API
     * key 对应的formKey
     * width 检测宽
     * height 检查高
     * size 检测大小
     * cb 回调
     * type 文件类型
     */

    getUploadprops = (fun: (data: any) => Promise<any>, wht?: FileWHT, preData?: Object,
        fileType?: string, cb?: Function): UploadFileProps => {
        const data = {
            api: fun,
            wht,
            preData,
            fileType,
            cb
        }

        return data
    }


    getInitialValue = (key) => {
        return this.imageTarget[key] || this.creativeTarget[key]
    }

    componentWillMount() {
        this.props.getOptionListDb()
        if (this.props.creativeId) {
            this.getDetail()
        }
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            platform = 'android',
            app_key = '',
            version = "",
            order_id = '',
            creative_name = '',
            language = '',
            creative_type = this.useCreativeType,
            creative_icon_url = '',
            title = '',
            description = '',
            if_show_comment = 1,
            status = 1,
            videoUrl = '',
            skip_to = this.useSkipTo,
            video_type = this.useVideoTypeValue,
            ige_pkgname = '',
            ige_leadvideo_flag = this.useIgeFlag,
            ige_recoverlist_opps = 1,
            ige_recoverlist_re_en = 1,
            ige_switch_scene = 1,
            playback_time = 30,
            long_play_time = 120,
            lead_is_show_content = 1,
            lead_content_id,
            playicon_creative_offline_url = '',
            leadVideoUrl = '',
            ige_portrait_offline_url = '',
            ige_landscape_offline_url = '',
            ige_portrait_video_cover_url = '',
            ige_landscape_video_cover_url = '',
            ige_prefail = 0
        } = this.creativeTarget


        const getScale = (width: string | number, height?: number) => {
            if (width === 'landscape' || (width === 16 && height === 9)) {
                return {
                    minW_H: 1.75,
                    maxW_H: 1.80,
                    width: 16,
                    height: 9,
                }
            } else if (width === 'portrait' || (width === 9 && height === 16)) {
                return {
                    minW_H: 0.55,
                    maxW_H: 0.57,
                    width: 9,
                    height: 16,
                }
            } else {
                return {
                    width: Number(width), height: height || 100
                }
            }
        }

        const theVideoUrlPropsForVideoOrIge = this.getUploadprops(this.api.creative.uploadVideo, {
            ...getScale(this.videoType),
            isScale: true,
            time: 30,
            size: 4000
        }, {
                type: this.useCreativeType === 2 ? 3 : 4,
                video_type: this.videoType === 'portrait' ? 2 : 1,
                app_key: this.app_key
            }, 'video')

        const igeLeadVideoUrlProps = this.getUploadprops(this.api.creative.uploadVideo, {
            ...getScale(this.videoType),
            isScale: true,
            time: 8,
            size: 1000
        }, {
                type: 5,
                video_type: this.videoType === 'portrait' ? 2 : 1,
                app_key: this.app_key
            }, 'video')


        const igeCarouselVideoUrlPropsPortrait = this.getUploadprops(this.api.creative.uploadVideo, {
            ...getScale(9, 16),
            isScale: true,
            size: 1500
        }, {
                type: 6,
                video_type: 2,
                app_key: this.app_key
            }, 'video')

        const igeCarouselVideoUrlPropsLandscape = this.getUploadprops(this.api.creative.uploadVideo, {
            ...getScale(16, 9),
            isScale: true,
            size: 1500
        }, {
                type: 7,
                video_type: 1,
                app_key: this.app_key
            }, 'video')

        const theVideoUrlPropsForPlayicon = this.getUploadprops(this.api.creative.uploadVideo, {
            width: 1,
            height: 1,
            isScale: true,
            size: 4000
        }, {
                type: 8,
                // video_type: this.videoType === 'portrait' ? 2 : 1,
                app_key: this.app_key
            }, 'video')

        const creativeIconProps = this.getUploadprops(this.api.creative.handleUploadImg, {
            width: 180,
            height: 180,
            size: 100
        }, {
                type: 2,
                app_key: this.app_key
            })


        const igePortraitCover = this.getUploadprops(this.api.creative.handleUploadImg, {
            ...getScale(9, 16),
            isScale: true,
            size: 200
        }, {
                type: 3,
                app_key: this.app_key
            })

        const igeLandscapeCover = this.getUploadprops(this.api.creative.handleUploadImg, {
            // width: 16,// height: 9,
            ...getScale(16, 9),
            isScale: true,
            size: 200
        }, {
                type: 3,
                app_key: this.app_key
            })


        return (
            <React.Fragment>
                <AccountModel
                    visible={this.accountShow}
                    onCancel={() => this.toggleAppShow(false)}
                    onOk={(id) => this.companyModelOk(id)}
                    platform={this.platform}
                    app_key={this.app_key}
                />

                <div className={`sb-form ${styles.creativeModal}`}>
                    <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.creativeModal} >
                        {

                            !this.isAdd && <FormItem label="ID">
                                {this.props.creativeId}
                            </FormItem>
                        }

                        {
                            !this.props.type && <FormItem label="Status">
                                {getFieldDecorator('status', {
                                    initialValue: Number(status),
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
                            !this.props.creative && <FormItem label="Platform">
                                {getFieldDecorator('platform',
                                    {
                                        initialValue: this.platform,
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
                            !this.props.creative && <FormItem label="App ID">
                                {getFieldDecorator('app_key', {
                                    initialValue: this.app_key,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Select
                                    showSearch
                                    onChange={this.setAppid}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.usePkgnameData.map((c) => (
                                        <Select.Option value={c.app_key} key={c.app_key}>
                                            {c.app_id_key}
                                        </Select.Option>
                                    ))}
                                </Select>)}
                            </FormItem>
                        }

                        <FormItem label="Creative Version">
                            {getFieldDecorator('version', {
                                initialValue: version,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" onChange={this.versionChange} />)}
                        </FormItem>

                        <FormItem label="Order ID"  >
                            {getFieldDecorator('order_id', {
                                initialValue: order_id,
                                validateTrigger: 'blur',
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    },
                                    {
                                        validator: (r, v, callback) => {
                                            const reg = /^[0-9]*$/;
                                            if (!reg.test(v)) {
                                                callback('The Exchange Rate should be a positive integer!')
                                            }
                                            callback()
                                        }
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={!this.isAdd && !!order_id} onChange={this.order_idChange} />)}
                        </FormItem>

                        <FormItem label="Creative Language">
                            {getFieldDecorator('language', {
                                initialValue: language,
                                rules: [
                                    {
                                        required: true, message: "Required",
                                    },
                                ]
                            })(<Select
                                showSearch
                                onChange={this.languageChange}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.language.map(c => (
                                    <Select.Option key={c} value={c}>
                                        {c}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>

                        <FormItem label="Creative Name"  >
                            {getFieldDecorator('creative_name', {
                                initialValue: creative_name,
                            })(<Input autoComplete="off" disabled={true} />)}
                        </FormItem>

                        <FormItem label="Icon" className={styles.autoHeight}>
                            {getFieldDecorator('creative_icon_url', {
                                initialValue: this.getInitialValue('creative_icon_url'),
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                // className={styles.btnUpload}
                                // className={styles.btnUploadGroup}
                                <UploadFile
                                    className={styles.uploadIconGroup}
                                    {...creativeIconProps}
                                >
                                    <Icon type='plus' />
                                </UploadFile>
                            )}
                        </FormItem>

                        <FormItem label="Creative Type">
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
                                        showSearch
                                        disabled={!this.isAdd}
                                        onChange={(val) => this.setCreativeType(val)}
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {optionListDb.CreativeType.map(c => (
                                            <Select.Option key={c.creative_name} value={c.id}>
                                                {c.creative_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                        {/* video */}
                        {
                            this.useCreativeType === 2 && <React.Fragment>
                                <FormItem label="Video Type">
                                    {getFieldDecorator('video_type',
                                        {
                                            initialValue: video_type,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                disabled={!this.isAdd}
                                                onChange={(val) => this.setVideoType(val)}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {videoType.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.key}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                </FormItem>
                                <FormItem className={`${styles.autoHeight} ${styles.nolabel} ${styles.UploadBox}`}>
                                    <div className={styles.title}>
                                        <div className="left">
                                            {this.videoType}
                                        </div>
                                        <div className="right">
                                            {this.videoType === 'portrait' ? '9:16' : '16:9'}
                                        </div>
                                    </div>
                                    {this.videoType === 'portrait' ? getFieldDecorator('common_portrait_creative_offline_url', {
                                        initialValue: this.getInitialValue('common_portrait_creative_offline_url'),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...theVideoUrlPropsForVideoOrIge}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    ) : getFieldDecorator('common_landscape_creative_offline_url', {
                                        initialValue: this.getInitialValue('common_landscape_creative_offline_url'),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...theVideoUrlPropsForVideoOrIge}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    )
                                    }
                                </FormItem>

                                <FormItem label="Appwall Description">
                                    <Input autoComplete="off" value={this.appwall_description}
                                        disabled={true} />
                                </FormItem>
                            </React.Fragment>
                        }
                        {
                            this.useCreativeType === 3 && <React.Fragment>
                                <FormItem label="IGE Video">
                                    {getFieldDecorator('video_type',
                                        {
                                            initialValue: video_type,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                disabled={!this.isAdd}
                                                onChange={(val) => this.setVideoType(val)}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {videoType.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.key}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                </FormItem>
                                <FormItem className={`${styles.autoHeight} ${styles.nolabel} ${styles.UploadBox}`}>
                                    <div className={styles.title}>
                                        <div className="left">
                                            {this.videoType}
                                        </div>
                                        <div className="right">
                                            {this.videoType === 'portrait' ? '9:16' : '16:9'}
                                        </div>
                                    </div>
                                    {this.videoType === 'portrait' ? getFieldDecorator('common_portrait_creative_online_url', {
                                        initialValue: this.getInitialValue('common_portrait_creative_online_url'),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...theVideoUrlPropsForVideoOrIge}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    ) : getFieldDecorator('common_landscape_creative_online_url', {
                                        initialValue: this.getInitialValue('common_landscape_creative_online_url'),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...theVideoUrlPropsForVideoOrIge}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    )
                                    }
                                </FormItem>

                                <FormItem label="IGE Leadvideo">
                                    <Select
                                        showSearch
                                        disabled={true}
                                        value={this.videoType}
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {videoType.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </FormItem>
                                <FormItem className={`${styles.autoHeight} ${styles.nolabel} ${styles.UploadBox}`}>
                                    <div className={styles.title}>
                                        <div className="left">
                                            {this.videoType}
                                        </div>
                                        <div className="right">
                                            {this.videoType === 'portrait' ? '9:16' : '16:9'}
                                        </div>
                                    </div>
                                    {this.videoType === 'portrait' ? getFieldDecorator('ige_leadvideo_portrait_offline_url', {
                                        initialValue: this.getInitialValue('ige_leadvideo_portrait_offline_url'),
                                        rules: [
                                            {
                                                required: this.useIgeFlag !== 2, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...igeLeadVideoUrlProps}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    ) : getFieldDecorator('ige_leadvideo_landscape_offline_url', {
                                        initialValue: this.getInitialValue('ige_leadvideo_landscape_offline_url'),
                                        rules: [
                                            {
                                                required: this.useIgeFlag !== 2, message: "Required"
                                            }
                                        ]
                                    })(
                                        <UploadFile
                                            className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`}
                                            {...igeLeadVideoUrlProps}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    )}
                                </FormItem>
                                {/* ige-----load-------box */}
                                <Row>
                                    <Col span={5}>
                                        <p style={{ textAlign: 'right', marginRight: '12px' }}>IGE Carousel Video:</p>
                                    </Col>
                                    <Col span={8}>
                                        <div className={styles.wang}>
                                            <div className={styles.UploadBox}>
                                                <div className={styles.title}>
                                                    <div className="left">
                                                        Portrait
                                                </div>
                                                    <div className="right">
                                                        9:16
                                                </div>
                                                </div>
                                                <div>
                                                    {getFieldDecorator('ige_portrait_offline_url', {
                                                        initialValue: this.getInitialValue('ige_portrait_offline_url'),
                                                    })(
                                                        <UploadFile
                                                            className={`${styles.sunjiao} ${styles.shu}`}
                                                            {...igeCarouselVideoUrlPropsPortrait}
                                                        >
                                                            <div className={styles.full} />
                                                        </UploadFile>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.UploadBox}>
                                                <div className={styles.title}>
                                                    <div className="left">
                                                        Landscape
                                                </div>
                                                    <div className="right">
                                                        16:9
                                                </div>
                                                </div>
                                                <div>
                                                    {getFieldDecorator('ige_landscape_offline_url', {
                                                        initialValue: this.getInitialValue('ige_landscape_offline_url'),
                                                    })(
                                                        <UploadFile
                                                            className={`${styles.sunjiao} ${styles.heng}`}
                                                            {...igeCarouselVideoUrlPropsLandscape}
                                                        >
                                                            <div className={styles.full} />
                                                        </UploadFile>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.wang}>
                                            <div className={styles.UploadBox}>
                                                <div className={styles.title}>
                                                    <div className="left">
                                                        Portrait
                                                </div>
                                                    <div className="right">
                                                        9:16
                                                </div>
                                                </div>
                                                <div>
                                                    {getFieldDecorator('ige_portrait_video_cover_url', {
                                                        initialValue: this.getInitialValue('ige_portrait_video_cover_url'),
                                                    })(
                                                        <UploadFile
                                                            className={`${styles.sunjiao} ${styles.shu}`}
                                                            {...igePortraitCover}
                                                        >
                                                            <div className={styles.full} />
                                                        </UploadFile>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.UploadBox}>
                                                <div className={styles.title}>
                                                    <div className="left">
                                                        Landscape
                                                </div>
                                                    <div className="right">
                                                        16:9
                                                </div>
                                                </div>
                                                <div>
                                                    {getFieldDecorator('ige_landscape_video_cover_url', {
                                                        initialValue: this.getInitialValue('ige_landscape_video_cover_url'),
                                                    })(
                                                        <UploadFile
                                                            className={`${styles.sunjiao} ${styles.heng}`}
                                                            {...igeLandscapeCover}
                                                        >
                                                            <div className={styles.full} />
                                                        </UploadFile>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <FormItem label="IGE Pkgname"  >
                                    {/* {getFieldDecorator('ige_pkgname', {
                                    initialValue: ige_pkgname,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })( */}
                                    <Input autoComplete="off" value={this.appId} disabled={true} />
                                    {/* )} */}
                                </FormItem>
                                <FormItem label="IGE Leadvideo Flag">
                                    {getFieldDecorator('ige_leadvideo_flag',
                                        {
                                            initialValue: ige_leadvideo_flag,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                onChange={(val) => this.setIgeFlag(val)}
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {igeFlag.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.key}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                </FormItem>
                                <FormItem label="IGE Recoverlist Opps">
                                    {getFieldDecorator('ige_recoverlist_opps', {
                                        initialValue: Number(ige_recoverlist_opps),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group>
                                            {YesOrNo.map(c => (
                                                <Radio key={c.key} value={c.value}>
                                                    {c.key}
                                                </Radio>
                                            ))}
                                        </Radio.Group>
                                    )}
                                </FormItem>
                                <FormItem label="IGE Close To Confirm">
                                    {getFieldDecorator('ige_recoverlist_re_en', {
                                        initialValue: Number(ige_recoverlist_re_en),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group>
                                            {YesOrNo.map(c => (
                                                <Radio key={c.key} value={c.value}>
                                                    {c.key}
                                                </Radio>
                                            ))}
                                        </Radio.Group>
                                    )}
                                </FormItem>

                                <FormItem label="IGE Switch Scene">
                                    {getFieldDecorator('ige_switch_scene',
                                        {
                                            initialValue: ige_switch_scene,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            >
                                                {igeScene.map(c => (
                                                    <Select.Option {...c}>
                                                        {c.key}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                </FormItem>
                                <FormItem label="Minimum Playing Time">
                                    {getFieldDecorator('playback_time', {
                                        initialValue: playback_time,
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
                                    })(<InputNumber style={{ width: '50%' }} onChange={this.playback_timeChange} precision={0} />)}
                                    <span>seconds</span>

                                </FormItem>
                                <FormItem label="Maximum Play Time">
                                    {getFieldDecorator('long_play_time', {
                                        initialValue: long_play_time,
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
                                    })(<InputNumber precision={0} />)}
                                    <span>seconds</span>
                                </FormItem>

                                <FormItem label="Appwall Description">
                                    <Input autoComplete="off" value={this.appwall_description}
                                        disabled={true} />
                                </FormItem>
                            </React.Fragment>
                        }
                        {
                            this.useCreativeType === 4 && <React.Fragment>
                                <FormItem className={`${styles.autoHeight} ${styles.nolabel} ${styles.UploadBox}`}>
                                    <div className={styles.title}>
                                        <div className="left">
                                            Square video
                                            </div>
                                        <div className="right">
                                            1:1
                                            </div>
                                    </div>
                                    {getFieldDecorator('playicon_creative_offline_url', {
                                        initialValue: this.getInitialValue('playicon_creative_offline_url'),

                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(

                                        <UploadFile
                                            className={`${styles.sunjiao} ${styles.Square}`}
                                            {...theVideoUrlPropsForPlayicon}
                                        >
                                            <div className={styles.full} />
                                        </UploadFile>
                                    )}
                                </FormItem>

                                <FormItem label="Skip to">
                                    {getFieldDecorator('skip_to', {
                                        initialValue: skip_to,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group
                                            onChange={(e) => this.skipToChange(e)}
                                        >
                                            {skipToOption.map(c => (
                                                <Radio {...c}>
                                                    {c.key}
                                                </Radio>
                                            ))}
                                        </Radio.Group>
                                    )}
                                </FormItem>
                                {
                                    this.useSkipTo === 'ige' && <React.Fragment>
                                        <FormItem label="IGE Pkgname"  >
                                            {/* {getFieldDecorator('ige_pkgname', {
                                            initialValue: ige_pkgname,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })( */}
                                            <Input autoComplete="off" value={this.appId} disabled={true} />
                                            {/* )} */}
                                        </FormItem>
                                        <FormItem label="IGE Leadvideo Flag">
                                            {getFieldDecorator('ige_leadvideo_flag',
                                                {
                                                    initialValue: ige_leadvideo_flag,
                                                    rules: [
                                                        {
                                                            required: true, message: "Required"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        showSearch
                                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    >
                                                        {igeFlag.map(c => (
                                                            <Select.Option {...c}>
                                                                {c.key}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                )}
                                        </FormItem>
                                        <FormItem label="IGE Recoverlist Opps">
                                            {getFieldDecorator('ige_recoverlist_opps', {
                                                initialValue: Number(ige_recoverlist_opps),
                                                rules: [
                                                    {
                                                        required: true, message: "Required"
                                                    }
                                                ]
                                            })(
                                                <Radio.Group>
                                                    {YesOrNo.map(c => (
                                                        <Radio key={c.key} value={c.value}>
                                                            {c.key}
                                                        </Radio>
                                                    ))}
                                                </Radio.Group>
                                            )}
                                        </FormItem>
                                        <FormItem label="IGE Close To Confirm">
                                            {getFieldDecorator('ige_recoverlist_re_en', {
                                                initialValue: Number(ige_recoverlist_re_en),
                                                rules: [
                                                    {
                                                        required: true, message: "Required"
                                                    }
                                                ]
                                            })(
                                                <Radio.Group>
                                                    {YesOrNo.map(c => (
                                                        <Radio key={c.key} value={c.value}>
                                                            {c.key}
                                                        </Radio>
                                                    ))}
                                                </Radio.Group>
                                            )}
                                        </FormItem>

                                        <FormItem label="IGE Switch Scene">
                                            {getFieldDecorator('ige_switch_scene',
                                                {
                                                    initialValue: ige_switch_scene,
                                                    rules: [
                                                        {
                                                            required: true, message: "Required"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        showSearch
                                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                    >
                                                        {igeScene.map(c => (
                                                            <Select.Option {...c}>
                                                                {c.key}
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                )}
                                        </FormItem>
                                        <FormItem label="Minimum Playing Time">
                                            {getFieldDecorator('playback_time', {
                                                initialValue: playback_time,
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
                                            })(<InputNumber precision={0} />)}
                                            <span>seconds</span>

                                        </FormItem>
                                        <FormItem label="Maximum Play Time">
                                            {getFieldDecorator('long_play_time', {
                                                initialValue: long_play_time,
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
                                            })(<InputNumber precision={0} />)}
                                            <span>seconds</span>
                                        </FormItem>
                                    </React.Fragment>
                                }
                            </React.Fragment>

                        }

                        {
                            (this.useCreativeType === 3 || (this.useCreativeType === 4 && this.useSkipTo === 'ige')) && <FormItem label="IGE First Frame Prefail">
                                {getFieldDecorator('ige_prefail', {
                                    initialValue: Number(ige_prefail),
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Radio.Group>
                                        {igePrefailOption.map(c => (
                                            <Radio key={c.key} value={c.value}>
                                                {c.key}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                )}
                            </FormItem>
                        }



                        <FormItem label="If Show Comment">
                            {getFieldDecorator('if_show_comment', {
                                initialValue: Number(if_show_comment),
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group>
                                    {YesOrNo.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>

                        {
                            (this.useCreativeType === 3 || (this.useCreativeType === 4 && this.useSkipTo === 'ige')) && <React.Fragment>

                                <FormItem label="If Show Lead Content">
                                    {getFieldDecorator('lead_is_show_content', {
                                        initialValue: Number(this.useNeedLc),
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Radio.Group
                                            onChange={(e) => this.setNeedLC(e)}
                                        >
                                            {YesOrNo.map(c => (
                                                <Radio key={c.key} value={c.value}>
                                                    {c.key}
                                                </Radio>
                                            ))}
                                        </Radio.Group>
                                    )}
                                </FormItem>

                                <FormItem label="Lead Content">
                                    {getFieldDecorator('lead_content_id', {
                                        initialValue: lead_content_id,
                                        rules: [
                                            {
                                                required: this.useNeedLc === 1, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '80%' }}
                                            showSearch
                                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            {this.useContentList.map(c => (
                                                <Select.Option key={c.id} value={c.id}>
                                                    {c.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                                    {
                                        this.app_key && <MyIcon className={styles.uploadICON} onClick={() => this.toggleAppShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                                    }
                                </FormItem>
                            </React.Fragment>
                        }

                        <FormItem label="App Name"  >
                            {getFieldDecorator('title', {
                                initialValue: title,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" />)}
                        </FormItem>

                        <FormItem label="App Description" className={styles.autoHeight} >
                            {getFieldDecorator('description', {
                                initialValue: description,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                        </FormItem>

                        <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                            <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                        </FormItem>
                    </Form>
                </div>
            </React.Fragment>

        )
    }
}

export default Form.create<IProps>()(CreativeModal)
