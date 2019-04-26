import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, } from 'mobx'
import { Form, Input, Button, message, Modal, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
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
        const template_pname = this.props.template_pname
        const str = (/ template$/).test(template_pname.toLowerCase()) ? template_pname : `${template_pname} Template`
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
            version = ''
        } = template || {}
        const _this = this
        const props = {
            showUploadList: false,
            accept: ".html",
            name: 'file',
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const isHtml = file.type === 'text/html';
                if (!isHtml) {
                    message.error('You can only upload html file!');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                    message.error('Image must smaller than 2MB!');
                }
                return isHtml && isLt2M;
            },
            customRequest: (data) => {
                this.setTemplate({})
                const formData = new FormData()
                formData.append('file', data.file)
                this.props.upTemplate(formData).then(res => {
                    this.setTemplate(res.data)
                }, () => {
                    this.setTemplate({})
                }).catch(() => {
                    this.setTemplate({})
                })
            }
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
                            })(<Input disabled={!this.typeIsAdd} />)}
                        </FormItem> : null
                    }
                    <FormItem {...formItemLayout} label="Version">
                        {getFieldDecorator('version', {
                            initialValue: version,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>
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
                                        <FormItem {...formItemLayout} className={styles.textItem} label="Player Template">
                                            <span>{this.comTemplate.template_url.split('/').pop()}</span>
                                            <Icon type='iconguanbi' onClick={this.removeFile} />
                                        </FormItem>
                                        <FormItem {...formItemLayout} className={styles.textItem} label="Template Url">
                                            <span>{this.comTemplate.template_url}</span>
                                        </FormItem>
                                        <FormItem {...formItemLayout} className={styles.textItem} label="Template MD5">
                                            <span>{this.comTemplate.template_md5}</span>
                                        </FormItem>
                                    </React.Fragment>
                                )
                            : null
                    }
                </Form>
            </Modal>
        )
    }
}

export default Form.create<IProps>()(TemplateModal)
