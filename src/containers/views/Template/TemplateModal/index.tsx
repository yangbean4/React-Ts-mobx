import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, } from 'mobx'
import { Form, Input, Button, message, Modal, Upload, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import { playicon_template, coins_animation } from '../default.config'
import { _nameCase } from '@utils/index'
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
        lg: { span: 7 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 },
        lg: { span: 17 }
    }
}

interface IStoreProps {
    createTemplate?: (template: ITemplateStore.ITemplate) => Promise<any>
    modifyTemplate?: (template: ITemplateStore.ITemplate) => Promise<any>
    getTemplates?: () => Promise<any>
    getSidebar?: () => Promise<any>
    templateConfig?: TemplateConfig
    template_pname?: string
    upTemplate?: (data) => Promise<any>
}
interface IProps extends IStoreProps {
    visible: boolean
    onCancel: () => void
    template?: ITemplateStore.ITemplate
}
@inject(
    (store: IStore): IStoreProps => {
        const { templateStore } = store

        const { templateConfig, createTemplate, modifyTemplate, getTemplates, upTemplate, template_pname } = templateStore
        return { templateConfig, createTemplate, modifyTemplate, getTemplates, upTemplate, template_pname }
    }
)

@observer
class TemplateModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private template: ITemplateStore.ITemplate = {}

    private removePropFile: boolean = false

    @observable
    private fileName: string
    @computed
    get typeIsAdd() {
        return !this.props.template || !this.props.template.id
    }

    @computed
    get comTemplate() {
        return this.template.template_url ? this.template : this.removePropFile ? {} : this.props.template || {}
    }

    @computed
    get title() {
        // const template_pname = this.props.template_pname
        // const str = (/ template$/).test(template_pname.toLowerCase()) ? template_pname : `${template_pname} Template`
        const str = this.props.template_pname
        return this.typeIsAdd ? `Add ${str}` : `Edit ${str}`
    }
    @computed
    get formCon() {
        const obj: object = this.props.templateConfig.add_filed;
        const arr = Object.entries(obj).filter(([key, value]) => !!value).map(([key, value]) => key)
        return new Set(arr)
    }

    @action
    toggleLoading = (type?) => {
        this.loading = type !== undefined ? type : !this.loading
    }

    @action
    setFileName = (name) => {
        this.fileName = name;
    }

    @action
    setTemplate = (data) => {
        const {
            template_url = '',
            template_md5 = '',
            template_name = '',
            url = '',
            md5 = ''
        } = data || {}
        this.template = {
            ...this.template,
            template_url: template_url || url,
            template_md5: template_md5 || md5,
            template_name: template_name
        }
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { template, createTemplate, modifyTemplate, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    try {
                        this.toggleLoading(true)
                        let data = { message: '' }
                        const pre = {
                            ...this.comTemplate,
                            version: values.version,
                            template_name: values.template_name,
                            template_type: values.template_type
                        }

                        if (this.typeIsAdd) {
                            data = await createTemplate(pre)
                        } else {
                            data = await modifyTemplate({ ...pre, id: template.id })
                        }
                        message.success(data.message)
                        this.props.getTemplates()
                        this.onCancel()
                    } catch (err) { }
                    this.toggleLoading(false)
                }
            }
        )
    }
    onCancel = () => {
        this.setTemplate({})
        this.props.onCancel()
        this.removePropFile = false
        this.toggleLoading(false)
        this.props.form.resetFields()
    }

    removeFile = () => {
        if (!this.template.template_url) {
            this.removePropFile = true
        }
        this.setTemplate({})
        return true
    }

    render() {
        const { template, form, visible } = this.props
        const { getFieldDecorator } = form
        const {
            template_name = '',
            version = '',
            template_type = undefined
        } = template || {}
        const type = ".html, .mp4";
        const props = {
            showUploadList: false,
            accept: type,
            name: 'file',
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const houz = file.name.split('.').pop()
                const isHtml = type.includes(houz)
                if (!isHtml) {
                    message.error('Upload failed! The file must be in HTML or MP4 format.');
                }
                const isLt2M = file.size / 1024 / 1024 < 3;
                if (!isLt2M) {
                    message.error('Image must smaller than 2MB!');
                }
                return isHtml && isLt2M;
            },
            customRequest: (data) => {
                this.setTemplate({})
                this.setFileName('')
                const formData = new FormData()
                formData.append('file', data.file)
                this.props.upTemplate(formData).then(res => {
                    this.setTemplate(res.data)
                    this.setFileName(data.file.name)
                }, () => {
                    this.setTemplate({})
                }).catch(() => {
                    this.setTemplate({})
                })
            }
        }

        const getUrl = () => {
            const arr = this.comTemplate.template_url.split('/')
            arr.pop()
            arr.push(this.fileName)
            return arr.join('/')
        }
        return (
            <Modal
                title={this.title}
                visible={visible}
                width={500}
                onOk={this.submit}
                destroyOnClose
                onCancel={this.onCancel}
                footer={
                    <Button type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
                }
            >
                <Form className={styles.templateModal}>
                    {
                        this.formCon.has('template_name') ? <FormItem {...formItemLayout} label="Template Name">
                            {getFieldDecorator('template_name', {
                                initialValue: template_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                        </FormItem> : null
                    }
                    {
                        this.formCon.has('version') ? <FormItem {...formItemLayout} label="Version">
                            {getFieldDecorator('version', {
                                initialValue: version,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" />)}
                        </FormItem> : null
                    }
                    {
                        this.formCon.has('template') ?
                            !this.comTemplate.template_url ? <FormItem {...formItemLayout} label="Template">
                                {getFieldDecorator('_file', {
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Upload {...props}>
                                    <Button>
                                        <Icon type="iconshangchuan1" /> Upload Template
                                </Button>
                                </Upload>)}
                            </FormItem> : (
                                    <React.Fragment>
                                        <FormItem {...formItemLayout} className={styles.textItem} label="Template">
                                            <span>{this.fileName !== undefined ? this.fileName : this.comTemplate.template_url.split('/').pop()}</span>
                                            <Icon type='iconguanbi' onClick={this.removeFile} />
                                        </FormItem>
                                        <FormItem {...formItemLayout} className={styles.textItem} label="Template Url">
                                            <span>{this.fileName !== undefined ? getUrl() : this.comTemplate.template_url}</span>
                                        </FormItem>
                                        {
                                            this.formCon.has('template_md5') ? <FormItem {...formItemLayout} className={styles.textItem} label="Template MD5">
                                                <span>{this.comTemplate.template_md5}</span>
                                            </FormItem> : null
                                        }
                                    </React.Fragment>
                                )
                            : null
                    }
                    {
                        this.props.template_pname && _nameCase(this.props.template_pname || '') === 'playicon_template' && (
                            <FormItem {...formItemLayout} label="Template Type">
                                {getFieldDecorator('template_type', {
                                    initialValue: template_type,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Radio.Group
                                        disabled={!this.typeIsAdd}
                                    >
                                        {playicon_template.map(c => (
                                            <Radio key={c.key} value={c.value}>
                                                {c.key}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                )}
                            </FormItem>
                        )
                    }
                    {
                        this.props.template_pname && _nameCase(this.props.template_pname || '') === 'coins_animation' && (
                            <FormItem {...formItemLayout} label="Template Type">
                                {getFieldDecorator('template_type', {
                                    initialValue: template_type,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Radio.Group
                                        disabled={!this.typeIsAdd}
                                    >
                                        {coins_animation.map(c => (
                                            <Radio key={c.key} value={c.value}>
                                                {c.key}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                )}
                            </FormItem>
                        )
                    }
                </Form>
            </Modal>
        )
    }
}

export default Form.create<IProps>()(TemplateModal)
