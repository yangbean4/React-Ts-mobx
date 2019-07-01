import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Icon, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { Jump, IGE } from '../../config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import InputColor from '@components/InputColor/index'
import UploadFile from '@components/UploadFile'

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

interface IStoreProps {
    modifyEndcard?: (endcard: IEndcardStore.IEndcard) => Promise<any>
    createEndcard?: (endcard: IEndcardStore.IEndcard) => Promise<any>
    routerStore?: RouterStore
    getOptionListDb?: () => Promise<any>
    optionListDb?: IEndcardStore.OptionListDb
}

interface IProps extends IStoreProps {
    endcardId?: number
    endcard?: IEndcardStore.IEndcard
    app_key?: string
    platform?: string
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { endcardStore, routerStore } = store
        const { createEndcard, modifyEndcard, getOptionListDb, optionListDb } = endcardStore
        return { routerStore, createEndcard, modifyEndcard, getOptionListDb, optionListDb }
    }
)
@observer
class EndcardModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private imageTarget: object = {}

    private gjbUrl = ''

    @observable
    private endcardTarget: IEndcardStore.IEndcard = {}

    @observable
    private platform: string = this.props.platform || this.endcardTarget.platform || 'android'

    @observable
    private app_key: string = this.props.app_key || this.endcardTarget.app_key || undefined

    @observable
    private AppWall: number

    @observable
    private logo: string

    @computed
    get useAppWall() {
        return [this.AppWall, this.endcardTarget.template_id, this.props.optionListDb.template[0] && this.props.optionListDb.template[0].id].find(ele => ele !== undefined)
    }

    @computed
    get isHeng() {
        return (this.props.optionListDb.template.find(ele => ele.id === this.useAppWall) || {}).template_type === 1
    }

    @computed
    get isAdd() {
        return !this.props.endcardId
    }

    @computed
    get usePkgnameData() {
        return this.props.optionListDb.appIds[this.platform]
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

    @action
    AppWallCahnge = (e) => {
        this.AppWall = e.target.value
        this.removeFile('endcard_image_url_web_show')
        this.props.form.setFieldsValue({
            endcard_image_url_web_show: ''
        })
    }

    languageChange = (language) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id',])
        this.props.form.setFieldsValue({
            endcard_name: `${this.appName}_${data.order_id}_${data.version}_${language}`
        })
    }
    order_idChange = (order_id) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            endcard_name: `${this.appName}_${order_id.target.value}_${data.version}_${data.language}`
        })
    }

    versionChange = (version) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            endcard_name: `${this.appName}_${data.order_id}_${version.target.value}_${data.language}`
        })
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    setUrl = (data) => {
        this.gjbUrl = data.data.url
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/endcard')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createEndcard, form, modifyEndcard, endcardId, endcard, app_key } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        if (this.gjbUrl) {
                            values.endcard_image_url = this.gjbUrl
                            delete values.endcard_image_url_web_show
                        }

                        if (this.isAdd) {
                            if (app_key) {
                                values = {
                                    app_key,
                                    ...values,
                                }
                            } else {
                                localStorage.setItem('TargetEndcard', JSON.stringify(
                                    {
                                        app_id: this.appId,
                                        platform: values.platform
                                    }
                                ))
                            }
                            let data = await createEndcard(values)
                            message.success(data.message)
                            endcard ? this.props.onOk(data.data.id) : routerStore.push(`/endcard/edit/${data.data.app_key}`)
                        } else {
                            const data = await modifyEndcard({
                                ...this.endcardTarget,
                                ...values,
                                id: endcardId
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
        this.removeFile('endcard_image_url_web_show')
    }

    @action
    setAppid = (app_key) => {
        const appName = this.usePkgnameData.find(ele => ele.app_key === app_key).app_name
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            endcard_name: `${appName}_${data.order_id}_${data.version}_${data.language}`
        })
        runInAction('set_key', () => {
            this.app_key = app_key
        })
        this.removeFile('endcard_image_url_web_show')
    }

    @action
    removeFile = (key) => {
        this.props.form.setFieldsValue({
            [key]: ''
        })
        runInAction('clear_Image', () => {
            this.imageTarget[key] = ''
        })
    }

    @action
    getDetail = async () => {
        const res = await this.api.endcard.getEndcardInfo({ id: this.props.endcardId })
        runInAction('SET_APPGroup', () => {
            this.endcardTarget = { ...res.data }
        })
    }


    getUploadprops = (fun: Function, key: string, width: number,
        height: number, size: number, preData?,
        cb?: Function, type = ".png, .jpg, .jpeg") => {

        const errorCb = (error) => { console.log(error); this.removeFile(key) };
        return {
            showUploadList: false,
            accept: ".png, .jpg, .jpeg",
            name: 'file',
            // listType: "picture",
            className: "avatar-uploader",
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const houz = file.name.split('.').pop()
                const isHtml = type.includes(houz)
                if (!isHtml) {
                    message.error(`Upload failed! The file must be in ${type} format.`);
                }
                const isLt2M = file.size / 1024 < size;
                if (!isLt2M) {
                    const msg = size >= 1000 ? `${size / 1000} M` : `${size}kb`
                    message.error(`Failure，The file size cannot exceed ${msg}!`);
                }
                if (isHtml && isLt2M) {
                    return testSize(file, { width, height }).catch((err) => {
                        console.log(err)
                        message.error(`Please upload Image at ${width}*${height}px`);
                        return Promise.reject()
                    })
                } else {
                    return isHtml && isLt2M;
                }
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
        if (this.props.endcardId) {
            this.getDetail()
        }
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const { width, height } = this.isHeng ? {
            width: 1920, height: 1080
        } : {
                height: 1920, width: 1080
            }

        const {
            platform = 'android',
            app_key = '',
            version = "",
            order_id = '',
            endcard_name = '',
            language = '',
            template_id = this.useAppWall,
            endcard_image_url_web_show = '',
            cta = 'Download',
            cta_text_col = '#FFFFFF',
            cta_bkgd = '#0087ff',
            cta_edge = '#0087ff',
            cta_pic = '',
            is_automatic_jump = 0,
            ige_recoverlist_endcard = 1,
            status = 1,
        } = this.endcardTarget

        const endcard_image = this.imageTarget['endcard_image_url_web_show'] || this.endcardTarget.endcard_image_url_web_show
        const ctaPic = this.imageTarget['cta_pic'] || cta_pic

        return (
            <div className='sb-form'>
                <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.endcardModal} >
                    {

                        !this.isAdd && <FormItem label="ID">
                            {this.props.endcardId}
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
                        !this.props.endcard && <FormItem label="Platform">
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
                        !this.props.endcard && <FormItem label="App ID">
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

                    <FormItem label="Endcard Version">
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

                    <FormItem label="Endcard Language">
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

                    <FormItem label="Endcard Name"  >
                        {getFieldDecorator('endcard_name', {
                            initialValue: endcard_name,
                        })(<Input autoComplete="off" disabled={true} />)}
                    </FormItem>

                    <FormItem {...bigLayout} className={styles.hasImg + ` ${styles.autoHeight}`} label='Endcard Template'>
                        {getFieldDecorator('template_id', {
                            initialValue: template_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group
                                onChange={this.AppWallCahnge}
                            >
                                {optionListDb.template.map(c => (
                                    <div className={styles.GroupBox} key={c.id}>
                                        <div className={styles.imgBox} style={{ backgroundImage: 'url(' + c.template_image + ')' }}></div>
                                        <Radio value={c.id}>
                                            {c.id}
                                        </Radio>
                                    </div>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>


                    <FormItem label="Cover Image" className={styles.autoHeight + ` ${styles.UploadBox}`}>
                        <div className={styles.title}>
                            <div className="left">
                                {this.isHeng ? 'Landscape' : 'Portrait'}
                            </div>
                            <div className="right">
                                {this.isHeng ? '1920*1080px' : '1080*1920px'}
                            </div>
                        </div>
                        {getFieldDecorator('endcard_image_url_web_show', {
                            initialValue: endcard_image,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <UploadFile
                                className={this.isHeng ? `${styles.sunjiao} ${styles.heng}` : `${styles.sunjiao} ${styles.shu}`}
                                api={this.api.util.uploadCoverImage}
                                wht={{ width: width, height: height, size: 200 }}
                                callBack={this.setUrl}
                                preData={{
                                    platform: this.platform,
                                    app_id: this.appId
                                }}
                            >
                                <div className={styles.full}></div>
                            </UploadFile>
                        )}
                    </FormItem>
                    {
                        (this.useAppWall === '007' || this.useAppWall === '008') && (
                            <React.Fragment>
                                <FormItem label="Cta Text"  >
                                    {getFieldDecorator('cta', {
                                        initialValue: cta,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<Input autoComplete="off" />)}
                                </FormItem>

                                <FormItem label="Cta text color"  >
                                    {getFieldDecorator('cta_text_col', {
                                        initialValue: cta_text_col,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<InputColor />)}
                                </FormItem>

                                <FormItem label="Cta Background color"  >
                                    {getFieldDecorator('cta_bkgd', {
                                        initialValue: cta_bkgd,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<InputColor />)}
                                </FormItem>

                                <FormItem label="Cta edg color"  >
                                    {getFieldDecorator('cta_edge', {
                                        initialValue: cta_edge,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<InputColor />)}
                                </FormItem>

                            </React.Fragment>
                        )
                    }

                    {
                        (this.useAppWall !== '005' && this.useAppWall !== '006') && <FormItem label="Button Image" className={styles.btnUploadGroup} >
                            {getFieldDecorator('cta_pic', {
                                initialValue: ctaPic,
                            })(
                                <UploadFile
                                    api={this.api.util.uploadIcon}
                                    wht={{ width: 422, height: 62, size: 10 }}
                                >
                                    <div className={styles.btnUpload} >
                                        <Icon type='plus' />
                                    </div>
                                </UploadFile>
                            )}

                            <span className={styles.btnUploadTitle}>
                                422*62px,≤10kb
                         </span>
                        </FormItem>
                    }



                    <FormItem label="Automatic Jump">
                        {getFieldDecorator('is_automatic_jump', {
                            initialValue: is_automatic_jump,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {Jump.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="IGE Recoverlist Endcard">
                        {getFieldDecorator('ige_recoverlist_endcard', {
                            initialValue: ige_recoverlist_endcard,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {IGE.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(EndcardModal)
