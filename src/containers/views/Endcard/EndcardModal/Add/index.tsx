import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, Icon as AntIcon, Upload, Icon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { Jump, IGE } from '../../config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import InputColor from '@components/InputColor/index'
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

    @observable
    private platform: string

    @observable
    private appId: string

    @observable
    private endcardTarget: IEndcardStore.IEndcard = {}

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
        return (Number(this.useAppWall) & 1) === 1
    }

    @computed
    get isAdd() {
        return !this.props.endcardId
    }

    @computed
    get appName() {
        return this.usePkgnameData.find(ele => ele.app_id === this.appId).app_name
    }

    @computed
    get usePlatform() {
        return this.platform || this.endcardTarget.platform || 'android'
    }

    @computed
    get usePkgnameData() {
        return this.props.optionListDb.appIds[this.usePlatform]
    }

    @action
    AppWallCahnge = (e) => {
        this.AppWall = e.target.value
        this.removeFile('endcard_image_url')
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

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/endcard')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createEndcard, form, modifyEndcard, endcardId } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        const app_id = this.appId
                        values = {
                            ...values,
                            app_id,
                        }
                        if (this.isAdd) {
                            let data = await createEndcard(values)
                            localStorage.setItem('TargetEndcard', JSON.stringify(
                                {
                                    app_id,
                                    platform: values.platform
                                }
                            ))
                            message.success(data.message)
                            routerStore.push('/endcard/edit')
                        } else {
                            const data = await modifyEndcard({
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
        this.removeFile('endcard_image_url')
    }

    @action
    setAppid = (index) => {
        this.appId = this.usePkgnameData[index].app_id
        this.removeFile('endcard_image_url')
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
        const res = await this.api.appGroup.getAppGroupInfo({ id: this.props.endcardId })
        runInAction('SET_APPGroup', () => {
            this.endcardTarget = { ...res.data }
        })
    }


    getUploadprops = (fun: Function, key: string, width: number,
        height: number, size: number, preData?,
        cb?: Function, type = ".png, .jpg, .jpeg, .gif") => {

        const errorCb = (error) => { console.log(error); this.removeFile(key) };
        return {
            showUploadList: false,
            accept: ".png, .jpg, .jpeg, .gif",
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
                    message.error(`Image must smaller than ${size}kb!`);
                }
                // if (isHtml && isLt2M) {
                //     return testSize(file, width, height).catch(() => {
                //         message.error(`Image must be width:${width}px height:${height}px`);
                //         return Promise.reject()
                //     })
                // }
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
        if (this.props.endcardId) {
            this.getDetail()
        }
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const { uploadCoverImage, uploadIcon } = this.api.util
        const { width, height } = this.isHeng ? {
            width: 1920, height: 1080
        } : {
                height: 1920, width: 1080
            }
        const Landscapeprops = this.getUploadprops(uploadCoverImage, 'endcard_image_url', width, height, 200, {
            platform: this.usePlatform,
            app_id: this.appId
        })
        const ctaPicProps = this.getUploadprops(this.api.util.uploadIcon, 'cta_pic', 422, 62, 10)



        const {
            platform = 'android',
            app_id = '',
            version = "",
            order_id = '',
            endcard_name = '',
            language = '',
            template_id = this.useAppWall,
            endcard_image_url = '',
            cta = 'Download',
            cta_text_col = '#FFFFFF',
            cta_bkgd = '#0087ff',
            cta_edge = '#0087ff',
            cta_pic = '',
            automatic_jump = 0,
            is_show = 1,
            status = 1,
        } = this.endcardTarget

        const endcard_image = this.imageTarget['endcard_image_url'] || endcard_image_url
        const ctaPic = this.imageTarget['cta_pic'] || cta_pic
        console.log(ctaPic);
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
                            {getFieldDecorator('app_id', {
                                initialValue: app_id,
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
                                {this.usePkgnameData.map((c, index) => (
                                    <Select.Option value={index} key={index}>
                                        {c.app_id}
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
                        })(<Input onChange={this.versionChange} />)}
                    </FormItem>

                    <FormItem label="Order ID"  >
                        {getFieldDecorator('order_id', {
                            initialValue: order_id,
                        })(<Input disabled={!this.isAdd} onChange={this.order_idChange} />)}
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
                        })(<Input disabled={true} />)}
                    </FormItem>

                    <FormItem {...bigLayout} className={styles.hasImg} label='Endcard Template'>
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


                    <FormItem label="Cover Image" className={styles.autoHeight}>
                        {getFieldDecorator('endcard_image_url', {
                            initialValue: endcard_image_url,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <div className={styles.UploadBox}>
                                <div className={styles.title}>
                                    <div className="left">
                                        Landscape
                                    </div>
                                    <div className="right">
                                        {this.isHeng ? '1920*1080px' : '1080*1920px'}
                                    </div>
                                </div>
                                <div>
                                    <Upload {...Landscapeprops}>
                                        {

                                            <div className={this.isHeng ? `${styles.sunjiao} ${styles.heng}` : `${styles.sunjiao} ${styles.shu}`} >
                                                {
                                                    endcard_image && <img src={endcard_image} alt="avatar" />
                                                }
                                            </div>
                                        }
                                    </Upload>
                                </div>
                            </div>
                        )}
                    </FormItem>
                    {
                        this.isHeng && (
                            <React.Fragment>
                                <FormItem label="Cta Text"  >
                                    {getFieldDecorator('cta', {
                                        initialValue: cta,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(<Input />)}
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

                    <FormItem label="Button Image" >
                        {getFieldDecorator('cta_pic', {
                            initialValue: cta_pic,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <div className={styles.UploadBox}>
                                <div>
                                    <Upload {...ctaPicProps}>
                                        <div className={styles.btnUploadGroup}>
                                            <div className={styles.btnUpload} >
                                                {
                                                    ctaPic ? <img src={ctaPic} alt="avatar" />
                                                        : <Icon type='plus' />
                                                }
                                            </div>
                                            <div className={styles.btnUploadTitle}>
                                                422*62px,≤10kb
                                            </div>
                                        </div>

                                    </Upload>
                                </div>
                            </div>
                        )}
                    </FormItem>


                    <FormItem label="Automatic Jump">
                        {getFieldDecorator('automatic_jump', {
                            initialValue: automatic_jump,
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
                        {getFieldDecorator('is_show', {
                            initialValue: is_show,
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
