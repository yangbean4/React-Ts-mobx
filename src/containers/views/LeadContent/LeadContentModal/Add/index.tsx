import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { ComponentExt } from '@utils/reactExt'
import Icon from '@components/Icon'
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
    modifyLeadContent?: (leadContent: ILeadContentStore.ILeadContent) => Promise<any>
    createLeadContent?: (leadContent: ILeadContentStore.ILeadContent) => Promise<any>
    routerStore?: RouterStore
    getOptionListDb?: () => Promise<any>
    optionListDb?: ILeadContentStore.OptionListDb
}

interface IProps extends IStoreProps {
    leadContentId?: number
    leadContent?: ILeadContentStore.ILeadContent
    app_key?: string
    platform?: string
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { leadContentStore, routerStore } = store
        const { createLeadContent, modifyLeadContent, getOptionListDb, optionListDb } = leadContentStore
        return { routerStore, createLeadContent, modifyLeadContent, getOptionListDb, optionListDb }
    }
)
@observer
class LeadContentModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private leadContentTarget: ILeadContentStore.ILeadContent = this.props.leadContent || {}

    private md5: string = this.leadContentTarget.content_md5

    @observable
    private platform: string = this.props.platform || this.leadContentTarget.platform || 'android'

    @observable
    private app_key: string = this.props.app_key || this.leadContentTarget.app_key || undefined

    @observable
    private fileTarget: object = {}

    @computed
    get isAdd() {
        return !this.props.leadContentId
    }

    @computed
    get appTarget() {
        return this.usePkgnameData.find(ele => ele.app_key === this.app_key) || {}
    }

    @computed
    get appName() {
        return this.appTarget.app_name
    }
    @computed
    get appId() {
        return this.appTarget.app_id
    }

    @computed
    get usePkgnameData() {
        return this.props.optionListDb.appIds[this.platform]
    }

    languageChange = (language) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id',])
        this.props.form.setFieldsValue({
            name: `${this.appName}_${data.order_id}_${data.version}_${language}`
        })
    }
    order_idChange = (order_id) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            name: `${this.appName}_${order_id.target.value}_${data.version}_${data.language}`
        })
    }

    versionChange = (version) => {
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            name: `${this.appName}_${data.order_id}_${version.target.value}_${data.language}`
        })
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/leadContent')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createLeadContent, form, modifyLeadContent, leadContentId, leadContent, app_key } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        const md5 = this.md5 || leadContent.content_md5
                        values = md5 ? { ...values, content_md5: md5 } : values
                        if (values.status === undefined) {
                            values.status = 1
                        }
                        if (this.isAdd) {
                            if (app_key) {
                                values = {
                                    app_key,
                                    ...values,
                                }
                            } else {
                                localStorage.setItem('TargetLeadContent', JSON.stringify(
                                    {
                                        app_id: this.appId,
                                        platform: values.platform
                                    }
                                ))
                            }
                            let data = await createLeadContent(values)
                            message.success(data.message);
                            (this.props.type || leadContent) ? this.props.onOk(data.data.id) : routerStore.push(`/leadContent/edit/${data.data.app_key || app_key || values.app_key}`)
                        } else {
                            const data = await modifyLeadContent({
                                ...this.leadContentTarget,
                                ...values,
                                id: leadContentId
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
        this.props.form.setFieldsValue({
            app_key: ''
        })
    }

    @action
    setAppid = (app_key) => {
        const appName = this.usePkgnameData.find(ele => ele.app_key === app_key).app_name
        const data = this.props.form.getFieldsValue(['version', 'order_id', 'language'])
        this.props.form.setFieldsValue({
            name: `${appName}_${data.order_id}_${data.version}_${data.language}`
        })
        runInAction('set_key', () => {
            this.app_key = app_key
        })
    }

    @action
    removeFile = (key) => {
        this.props.form.setFieldsValue({
            [key]: ''
        })
        runInAction('clear_Image', () => {
            this.fileTarget[key] = ''
        })
    }

    componentWillMount() {
        this.props.getOptionListDb()
    }

    getUploadprops = (fun: Function, key: string, type = '.png, .jpg, .jpeg, .gif', size?: number, cb?: Function, libao?: boolean) => {
        const errorCb = (error) => { console.log(error); this.removeFile(key) };
        return {
            showUploadList: false,
            accept: type,
            name: 'file',
            className: 'avatar-uploader',
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const houz = file.name.split('.').pop()
                const isHtml = type.includes(houz)
                if (!isHtml) {
                    message.error(`The Endcard template file should be a  ${type}`);
                }
                let isLt2M = !size || file.size / 1024 < size;
                if (!isLt2M) {
                    message.error(`Failure，The file size cannot exceed ${size}kb`);
                }
                return isHtml && isLt2M
            },
            customRequest: (data) => {
                const formData = new FormData()
                const file = data.file
                formData.append('file', file)
                formData.append('app_key', this.app_key)

                fun(formData).then(res => {
                    const data = res.data
                    this.props.form.setFieldsValue({
                        [key]: data.url
                    })
                    runInAction('set_File', () => {
                        this.fileTarget[key] = file.name
                    })
                    cb && cb(data)
                }, errorCb).catch(errorCb)
            }
        }
    }

    render() {
        const { form, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            platform = this.platform,
            app_key = '',
            version = "",
            order_id = '',
            name = '',
            language = '',
            status = 1,
            content = ''
        } = this.leadContentTarget

        const urlName = this.fileTarget['content'] !== undefined ? this.fileTarget['content'] : (content || '').split('/').pop();
        const templateProps = this.getUploadprops(this.api.leadContent.uploadLeadContent, 'content', '.html', undefined, (data) => {
            this.md5 = data.md5
        })

        return (
            <div className='sb-form'>
                <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.leadContentModal} >
                    {

                        !this.isAdd && <FormItem label="ID">
                            {this.props.leadContentId}
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
                        !this.props.leadContent && !this.props.type && <FormItem label="Platform">
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
                        (!this.props.leadContent && !this.props.type) && <FormItem label="App ID">
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

                    <FormItem label="Lead Version">
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

                    <FormItem label="Lead Language">
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

                    <FormItem label="Lead Name"  >
                        {getFieldDecorator('name', {
                            initialValue: name,
                        })(<Input autoComplete="off" disabled={true} />)}
                    </FormItem>

                    <FormItem label="Lead content">
                        {getFieldDecorator('content', {
                            initialValue: content,
                            rules: [
                                {
                                    required: true, message: 'Required'
                                }
                            ]
                        })(
                            !urlName ? (<Upload {...templateProps}>
                                {
                                    urlName || (
                                        <Button>
                                            <Icon type="iconshangchuan1" /> Upload Template
                                    </Button>
                                    )
                                }
                            </Upload>) : (<div>
                                <span style={{ marginRight: 10 }}>{urlName}</span>
                                <Icon type="iconguanbi" onClick={() => this.removeFile('content')} />
                            </div>)
                        )
                        }
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        {
                            !this.props.type && <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                        }
                    </FormItem>
                </Form>

            </div >
        )
    }
}

export default Form.create<IProps>()(LeadContentModal)
