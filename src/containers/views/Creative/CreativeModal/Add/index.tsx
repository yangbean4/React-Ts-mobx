import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Icon, Upload, InputNumber, Row, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { showComment, videoType, descriptionOption, skipToOption, igeFlag, igeOption, igeScene } from '../../config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { typeOf, testSize } from '@utils/index';
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

interface hasResult {
    result?: string
}

interface Whs {
    width: number
    height: number
    isScale?: boolean
}

interface IStoreProps {
    modifyCreative?: (creative: ICreativeStore.ICreative) => Promise<any>
    createCreative?: (creative: ICreativeStore.ICreative) => Promise<any>
    routerStore?: RouterStore
    getOptionListDb?: () => Promise<any>
    optionListDb?: ICreativeStore.OptionListDb
}

interface IProps extends IStoreProps {
    creativeId?: number
    creative?: ICreativeStore.ICreative
    app_key?: string
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { creativeStore, routerStore } = store
        const { createCreative, modifyCreative, getOptionListDb, optionListDb } = creativeStore
        return { routerStore, createCreative, modifyCreative, getOptionListDb, optionListDb }
    }
)
@observer
class CreativeModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private imageTarget: object = {}

    @observable
    private creativeTarget: ICreativeStore.ICreative = {}

    @observable
    private platform: string

    @observable
    private appId: string = this.props.creative ? this.props.creative.app_id : undefined

    @observable
    private skipTo: string = this.creativeTarget.skip_to || 'ige'

    @observable
    private CreativeType: number

    @observable
    private videoType: string = this.creativeTarget.video_type || 'landscape'

    @observable
    private lead_video_type: string = this.creativeTarget.lead_video_type || 'landscape'

    @computed
    get useCreativeType() {
        return [this.CreativeType, this.creativeTarget.creative_type, 3].find(ele => ele !== undefined)
    }

    @computed
    get descriptionOption() {
        return descriptionOption
    }

    @computed
    get isAdd() {
        return !this.props.creativeId
    }

    @computed
    get appName() {
        return (this.usePkgnameData.find(ele => ele.app_id === this.appId) || {}).app_name
    }

    @computed
    get usePlatform() {
        return this.platform || this.creativeTarget.platform || 'android'
    }


    @computed
    get usePkgnameData() {
        return this.props.optionListDb.appIds[this.usePlatform]
    }

    @action
    setCreativeType = (value) => {
        this.CreativeType = value
        this.removeFile()
    }
    @action
    skipToChange = (e) => {
        this.skipTo = e.target.value
    }
    @action
    setVideoType = (value) => {
        this.videoType = value
    }
    @action
    setLeadVideoType = (value) => {
        this.lead_video_type = value
    }

    languageChange = (language) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id',])
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
                            creative ? this.props.onOk(data.data.id) : routerStore.push(`/creative/edit/${data.data.app_key}`)
                        } else {
                            const data = await modifyCreative({
                                ...this.creativeTarget,
                                ...values,
                                id: creativeId
                            })
                            message.success(data.message)
                            this.props.onOk(data.data.id)
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
    setPlatform = (type) => {
        this.platform = type
        this.removeFile('creative_image_url')
    }

    @action
    setAppid = (app_key) => {
        this.appId = this.usePkgnameData.find(ele => ele.app_key === app_key).app_id
        this.removeFile('creative_image_url')
    }

    @action
    removeFile = (key?) => {
        let keys = key ? [key] : Object.keys(this.imageTarget)
        let data = {}
        keys.forEach(ele => {
            data[ele] = ''
        })

        this.props.form.setFieldsValue({
            ...data
        })
        runInAction('clear_Image', () => {
            this.imageTarget = data
        })
    }

    @action
    getDetail = async () => {
        const res = await this.api.creative.getCreativeInfo({ id: this.props.creativeId })
        runInAction('SET_APPGroup', () => {
            this.creativeTarget = { ...res.data }
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

    getUploadprops = (fun: Function, key: string,
        whs?: Whs,
        size?: number, preData?,
        type = ".png, .jpg, .jpeg, .gif", cb?: Function) => {

        const errorCb = (error) => { console.log(error); this.removeFile(key) };
        return {
            showUploadList: false,
            accept: type === 'video' ? 'video/*' : type,
            name: 'file',
            // listType: "picture",
            className: "avatar-uploader",
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const houz = file.name.split('.').pop()
                const isHtml = type === 'video' || type.includes(houz)
                if (!isHtml) {
                    message.error(`Upload failed! The file must be in ${type} format.`);
                }
                const isLt2M = file.size / 1024 < size;
                if (!isLt2M) {
                    message.error(`Image must smaller than ${size}kb!`);
                }
                if (isHtml && isLt2M && whs) {
                    const { width, height, isScale = false } = whs;
                    return testSize(file, width, height, isScale).catch(() => {
                        message.error(`Image must be width:${width}px height:${height}px`);
                        return Promise.reject()
                    })
                }
                return isHtml && isLt2M;
            },
            customRequest: (data) => {
                const formData = new FormData()
                const file = data.file
                formData.append('file', file)
                if (preData && typeOf(preData) === 'object') {
                    Object.entries(preData).forEach(([key, value]) => {
                        const _value = value as string
                        formData.append(key, _value)
                    })
                }
                fun(formData).then(res => {
                    const data = res.data
                    this.props.form.setFieldsValue({
                        [key]: data.url
                    })
                    const fileRender = new FileReader()
                    fileRender.onload = (ev) => {
                        const target = ev.target as hasResult
                        runInAction('SET_URL', () => {
                            this.imageTarget[key] = target.result
                        })
                        cb && cb({
                            data,
                            localUrl: target.result
                        })
                    }
                    fileRender.readAsDataURL(file)
                }, errorCb).catch(errorCb)
            }
        }
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
            offer_id = '',
            creative_name = '',
            language = '',
            creative_type = this.useCreativeType,
            creative_icon_url = '',
            app_name = '',
            app_description = '',
            if_show_comment = 1,
            status = 1,
            videoUrl = '',
            skip_to = 'ige',
            video_type = this.videoType,
            lead_video_type = this.lead_video_type,
            appwall_description = '',
            ige_pkgname = '',
            ige_leadvideo_flag = undefined,
            ige_recoverlist_opps,
            ige_recoverlist_re_en,
            ige_switch_scene,
            playback_time,
            long_play_time,
            playicon_creative_offline_url = '',
            leadVideoUrl = '',
            ige_portrait_offline_url = '',
            ige_landscape_offline_url = '',
            ige_portrait_video_cover_url = '',
            ige_landscape_video_cover_url = ''
        } = this.creativeTarget

        const theVideoUrlPropsForVideoOrIge = this.getUploadprops(this.api.creative.uploadVideo, 'videoUrl', {
            width: this.videoType === 'portrait' ? 9 : 16,
            height: this.videoType === 'portrait' ? 16 : 9,
            isScale: true
        }, 4000, {
                type: this.useCreativeType === 2 ? 3 : 4,
                video_type: this.videoType === 'portrait' ? 2 : 1,
                app_name: this.appName
            }, 'video')
        const theVideoUrlPropsForVideoOrIge_url = this.imageTarget['videoUrl'] || videoUrl

        const igeLeadVideoUrlProps = this.getUploadprops(this.api.creative.uploadVideo, 'leadVideoUrl', {
            width: this.lead_video_type === 'portrait' ? 9 : 16,
            height: this.lead_video_type === 'portrait' ? 16 : 9,
            isScale: true
        }, 4000, {
                type: 5,
                video_type: this.lead_video_type === 'portrait' ? 2 : 1,
                app_name: this.appName
            }, 'video')

        const igeLeadVideoUrlProps_url = this.imageTarget['leadVideoUrl'] || leadVideoUrl

        const igeCarouselVideoUrlPropsPortrait = this.getUploadprops(this.api.creative.uploadVideo, 'ige_portrait_offline_url', {
            width: 9,
            height: 16,
            isScale: true
        }, 4000, {
                type: 6,
                video_type: 2,
                app_name: this.appName
            }, 'video')
        const igeCarouselVideoUrlPropsPortrait_url = this.imageTarget['ige_portrait_offline_url'] || ige_portrait_offline_url

        const igeCarouselVideoUrlPropsLandscape = this.getUploadprops(this.api.creative.uploadVideo, 'ige_landscape_offline_url', {
            width: 16,
            height: 9,
            isScale: true
        }, 4000, {
                type: 7,
                video_type: 1,
                app_name: this.appName
            }, 'video')
        const igeCarouselVideoUrlPropsLandscape_url = this.imageTarget['ige_landscape_offline_url'] || ige_landscape_offline_url

        const theVideoUrlPropsForPlayicon = this.getUploadprops(this.api.creative.uploadVideo, 'playicon_creative_offline_url', {
            width: 1,
            height: 1,
            isScale: true
        }, 4000, {
                type: 8,
                // video_type: this.videoType === 'portrait' ? 2 : 1,
                app_name: this.appName
            }, 'video')

        const theVideoUrlPropsForPlayicon_url = this.imageTarget['playicon_creative_offline_url'] || playicon_creative_offline_url



        const creativeIconProps = this.getUploadprops(this.api.creative.handleUploadImg, 'creative_icon_url', {
            width: 180,
            height: 180,
        }, 20, {
                type: 2,
                app_name: this.appName
            })
        const creativeIconProps_url = this.imageTarget['creative_icon_url'] || creative_icon_url


        const igePortraitCover = this.getUploadprops(this.api.creative.handleUploadImg, 'ige_portrait_video_cover_url', {
            width: 180,
            height: 180,
        }, 20, {
                type: 3,
                app_name: this.appName
            })
        const igePortraitCover_url = this.imageTarget['ige_portrait_video_cover_url'] || ige_portrait_video_cover_url

        const igeLandscapeCover = this.getUploadprops(this.api.creative.handleUploadImg, 'ige_landscape_video_cover_url', {
            width: 180,
            height: 180,
        }, 20, {
                type: 3,
                app_name: this.appName
            })
        const igeLandscapeCover_url = this.imageTarget['ige_landscape_video_cover_url'] || ige_landscape_video_cover_url


        return (
            <div className='sb-form'>
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
                        !this.props.creative && <FormItem label="App ID">
                            {getFieldDecorator('app_key', {
                                initialValue: app_key,
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
                        })(<Input onChange={this.versionChange} />)}
                    </FormItem>

                    <FormItem label="Order ID"  >
                        {getFieldDecorator('order_id', {
                            initialValue: offer_id,
                        })(<Input disabled={!this.isAdd} onChange={this.order_idChange} />)}
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
                        })(<Input disabled={true} />)}
                    </FormItem>

                    <FormItem label="Icon" className={styles.autoHeight}>
                        {getFieldDecorator('creative_icon_url', {
                            initialValue: creativeIconProps_url,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <div className={styles.UploadBox}>
                                <div>
                                    <Upload {...creativeIconProps}>
                                        <div className={styles.btnUploadGroup}>
                                            <div className={styles.btnUpload} >
                                                {
                                                    creativeIconProps_url ? <img src={creativeIconProps_url} alt="avatar" />
                                                        : <Icon type='plus' />
                                                }
                                            </div>
                                        </div>

                                    </Upload>
                                </div>
                            </div>
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
                            <FormItem className={styles.autoHeight + ` ${styles.nolabel}`}>
                                {getFieldDecorator('videoUrl', {
                                    initialValue: theVideoUrlPropsForVideoOrIge_url,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <div className={styles.UploadBox}>
                                        <div className={styles.title}>
                                            <div className="left">
                                                {this.videoType}
                                            </div>
                                            <div className="right">
                                                {this.videoType === 'portrait' ? '9:16' : '16:9'}
                                            </div>
                                        </div>
                                        <div>
                                            <Upload {...theVideoUrlPropsForVideoOrIge}>
                                                {

                                                    <div className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`} >
                                                        {
                                                            theVideoUrlPropsForVideoOrIge_url && <video src={theVideoUrlPropsForVideoOrIge_url} />
                                                        }
                                                    </div>
                                                }
                                            </Upload>
                                        </div>
                                    </div>
                                )}
                            </FormItem>

                            <FormItem label="Appwall Description">
                                {getFieldDecorator('appwall_description',
                                    {
                                        initialValue: appwall_description,
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
                                            {this.descriptionOption.map(c => (
                                                <Select.Option {...c}>
                                                    {c.key}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
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
                            <FormItem className={styles.autoHeight + ` ${styles.nolabel}`}>
                                {getFieldDecorator('videoUrl', {
                                    initialValue: videoUrl,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <div className={styles.UploadBox}>
                                        <div className={styles.title}>
                                            <div className="left">
                                                {this.videoType}
                                            </div>
                                            <div className="right">
                                                {this.videoType === 'portrait' ? '9:16' : '16:9'}
                                            </div>
                                        </div>
                                        <div>
                                            <Upload {...theVideoUrlPropsForVideoOrIge}>
                                                {

                                                    <div className={this.videoType === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`} >
                                                        {
                                                            theVideoUrlPropsForVideoOrIge_url && <video src={theVideoUrlPropsForVideoOrIge_url} />
                                                        }
                                                    </div>
                                                }
                                            </Upload>
                                        </div>
                                    </div>
                                )}
                            </FormItem>

                            <FormItem label="IGE Leadvideo">
                                {getFieldDecorator('lead_video_type',
                                    {
                                        initialValue: lead_video_type,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        <Select
                                            showSearch
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
                            <FormItem className={styles.autoHeight + ` ${styles.nolabel}`}>
                                {getFieldDecorator('leadVideoUrl', {
                                    initialValue: igeLeadVideoUrlProps_url,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <div className={styles.UploadBox}>
                                        <div className={styles.title}>
                                            <div className="left">
                                                {this.lead_video_type}
                                            </div>
                                            <div className="right">
                                                {this.lead_video_type === 'portrait' ? '9:16' : '16:9'}
                                            </div>
                                        </div>
                                        <div>
                                            <Upload {...igeLeadVideoUrlProps}>
                                                {

                                                    <div className={this.lead_video_type === 'portrait' ? `${styles.sunjiao} ${styles.shu}` : `${styles.sunjiao} ${styles.heng}`} >
                                                        {
                                                            igeLeadVideoUrlProps_url && <video src={igeLeadVideoUrlProps_url} />
                                                        }
                                                    </div>
                                                }
                                            </Upload>
                                        </div>
                                    </div>
                                )}
                            </FormItem>
                            {/* ige-----load-------box */}
                            <Row>
                                <Col span={3}>
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
                                                {getFieldDecorator('ige_portrait_offline_url')(
                                                    <Upload {...igeCarouselVideoUrlPropsPortrait}>
                                                        {

                                                            <div className={`${styles.sunjiao} ${styles.shu}`} >
                                                                {
                                                                    igeCarouselVideoUrlPropsPortrait_url && <video src={igeCarouselVideoUrlPropsPortrait_url} />
                                                                }
                                                            </div>
                                                        }
                                                    </Upload>
                                                )
                                                }
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
                                                {getFieldDecorator('ige_portrait_offline_url')(
                                                    <Upload {...igeCarouselVideoUrlPropsLandscape}>
                                                        {

                                                            <div className={`${styles.sunjiao} ${styles.heng}`} >
                                                                {
                                                                    igeCarouselVideoUrlPropsLandscape_url && <video src={igeCarouselVideoUrlPropsLandscape_url} />
                                                                }
                                                            </div>
                                                        }
                                                    </Upload>
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
                                                {getFieldDecorator('ige_portrait_video_cover_url')(
                                                    <Upload {...igePortraitCover}>
                                                        {

                                                            <div className={`${styles.sunjiao} ${styles.shu}`} >
                                                                {
                                                                    igePortraitCover_url && <img src={igePortraitCover_url} />
                                                                }
                                                            </div>
                                                        }
                                                    </Upload>
                                                )
                                                }
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
                                                {getFieldDecorator('ige_landscape_video_cover_url')(
                                                    <Upload {...igeLandscapeCover}>
                                                        {

                                                            <div className={`${styles.sunjiao} ${styles.heng}`} >
                                                                {
                                                                    igeLandscapeCover_url && <img src={igeLandscapeCover_url} />
                                                                }
                                                            </div>
                                                        }
                                                    </Upload>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <FormItem label="IGE Pkgname"  >
                                {getFieldDecorator('ige_pkgname', {
                                    initialValue: ige_pkgname,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Input />)}
                            </FormItem>
                            <FormItem label="GE Leadvideo Flag">
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
                                        {igeOption.map(c => (
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
                                })(
                                    <Radio.Group>
                                        {igeOption.map(c => (
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

                            <FormItem label="Appwall Description">
                                {getFieldDecorator('appwall_description',
                                    {
                                        initialValue: appwall_description,
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
                                            {this.descriptionOption.map(c => (
                                                <Select.Option {...c}>
                                                    {c.key}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    )}
                            </FormItem>
                        </React.Fragment>
                    }
                    {
                        this.useCreativeType === 4 && <React.Fragment>
                            <FormItem className={styles.autoHeight + ` ${styles.nolabel}`}>
                                {getFieldDecorator('playicon_creative_offline_url', {
                                    initialValue: theVideoUrlPropsForPlayicon_url,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <div className={styles.UploadBox}>
                                        <div className={styles.title}>
                                            <div className="left">
                                                Square video
                                            </div>
                                            <div className="right">
                                                1:1
                                            </div>
                                        </div>
                                        <div>
                                            <Upload {...theVideoUrlPropsForPlayicon}>
                                                {

                                                    <div>
                                                        {
                                                            theVideoUrlPropsForPlayicon_url && <video src={theVideoUrlPropsForPlayicon_url} />
                                                        }
                                                    </div>
                                                }
                                            </Upload>
                                        </div>
                                    </div>
                                )}
                            </FormItem>

                            <FormItem label="Skip to">
                                {getFieldDecorator('status', {
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
                                this.skipTo === 'ige' && <React.Fragment>
                                    <FormItem label="IGE Pkgname"  >
                                        {getFieldDecorator('ige_pkgname', {
                                            initialValue: ige_pkgname,
                                            rules: [
                                                {
                                                    required: true, message: "Required"
                                                }
                                            ]
                                        })(<Input />)}
                                    </FormItem>
                                    <FormItem label="GE Leadvideo Flag">
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
                                                {igeOption.map(c => (
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
                                        })(
                                            <Radio.Group>
                                                {igeOption.map(c => (
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
                                {showComment.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>

                    <FormItem label="App Name"  >
                        {getFieldDecorator('app_name', {
                            initialValue: app_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="App Description"  >
                        {getFieldDecorator('app_description', {
                            initialValue: app_description,
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

            </div >
        )
    }
}

export default Form.create<IProps>()(CreativeModal)
