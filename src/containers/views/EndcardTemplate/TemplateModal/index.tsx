import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Button, message, Modal, Upload, Radio, Divider } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import { _nameCase } from '@utils/index'
import { statusOption } from '../default.config'
import { typeOf, testSize } from '@utils/index';

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
    createEndcardTemplate?: (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => Promise<any>
    modifyEndcardTemplate?: (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => Promise<any>
    getEndcardTemplates?: () => Promise<any>
}
interface IProps extends IStoreProps {
    visible: boolean
    onCancel: () => void
    endcardTemplate?: IEndcardTemplateStore.IEndcardTemplate
}
@inject(
    (store: IStore): IStoreProps => {
        const { endcardTemplateStore } = store

        const { createEndcardTemplate, modifyEndcardTemplate, getEndcardTemplates, } = endcardTemplateStore
        return { createEndcardTemplate, modifyEndcardTemplate, getEndcardTemplates }
    }
)

@observer
class EndcardTemplateModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    private md5: string = (this.props.endcardTemplate || {}).md5

    private template_type: number = (this.props.endcardTemplate || {}).template_type

    @observable
    private fileTarget: object = {}

    @observable
    private fileName: string

    @computed
    get typeIsAdd() {
        return !this.props.endcardTemplate || !this.props.endcardTemplate.id
    }

    @computed
    get title() {
        // const endcardTemplate_pname = this.props.endcardTemplate_pname
        // const str = (/ endcardTemplate$/).test(endcardTemplate_pname.toLowerCase()) ? endcardTemplate_pname : `${endcardTemplate_pname} EndcardTemplate`
        const str = 'Endcard Template'
        return this.typeIsAdd ? `Add ${str}` : `Edit ${str}`
    }

    @action
    toggleLoading = (type?) => {
        this.loading = type !== undefined ? type : !this.loading
    }

    @action
    setFileName = (name) => {
        this.fileName = name;
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { endcardTemplate, createEndcardTemplate, modifyEndcardTemplate, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    try {
                        this.toggleLoading(true)
                        let data = { message: '' }
                        const md5 = this.md5 || endcardTemplate.md5
                        const template_type = this.template_type || endcardTemplate.template_type
                        values = md5 ? { ...values, md5 } : values
                        values = template_type ? { ...values, template_type } : values

                        if (this.typeIsAdd) {
                            data = await createEndcardTemplate(values)
                        } else {
                            data = await modifyEndcardTemplate({ ...values, id: endcardTemplate.id })
                        }
                        message.success(data.message)
                        this.props.getEndcardTemplates()
                        this.onCancel()
                    } catch (err) { }
                    this.toggleLoading(false)
                }
            }
        )
    }
    onCancel = () => {
        this.props.onCancel()
        this.toggleLoading(false)
        this.props.form.resetFields()
        runInAction('clear_Image', () => {
            this.fileTarget = {};
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
                    const msg = type === '.zip' ? `The Endcard template file should be a  ${type}` : 'Please upload the file in png/jpg format'
                    message.error(msg);
                }
                let isLt2M = !size || file.size / 1024 < size;
                if (!isLt2M) {
                    message.error(`Failure，The file size cannot exceed ${size}kb`);
                }
                if (isHtml && isLt2M && libao) {
                    const target = file;
                    console.log(123)
                    return new Promise((resolve, reject) => {
                        try {
                            const objectURL = window.createObjectURL !== undefined
                                ? window.createObjectURL(target) : window.URL !== undefined
                                    ? window.URL.createObjectURL(target) : window.webkitURL !== undefined
                                        ? window.webkitURL.createObjectURL(target) : null
                            const imageCopy = new Image()
                            imageCopy.src = objectURL
                            imageCopy.onload = () => {
                                const width = imageCopy.width
                                const height = imageCopy.height
                                console.log(width, height)
                                if ((width === 300 && height === 167) || (width === 168 && height === 293)) {
                                    this.template_type = Number(width === 168 && height === 293) + 1
                                    resolve()
                                } else {
                                    this.template_type = undefined
                                    message.error('Please upload image at 300*167px or 168*293px!')
                                    reject()
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    })
                } else {
                    return isHtml && isLt2M
                }
            },
            customRequest: (data) => {
                const formData = new FormData()
                const file = data.file
                formData.append('file', file)

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
        const { endcardTemplate, form, visible } = this.props
        const { getFieldDecorator } = form
        const {
            template_name = '',
            template_url = '',
            template_image = '',
            status = 1
        } = endcardTemplate || {}
        const imageProps = this.getUploadprops(this.api.util.uploadTemplateImage, 'template_image', '.png, .jpg', 15, undefined, true)
        const templateProps = this.getUploadprops(this.api.util.uploadTemplate, 'template_url', '.zip', undefined, (data) => {
            this.md5 = data.md5
        })
        const urlName = this.fileTarget['template_url'] !== undefined ? this.fileTarget['template_url'] : (template_url || '').split('/').pop();
        const imageName = this.fileTarget['template_image'] !== undefined ? this.fileTarget['template_image'] : (template_image || '').split('/').pop();
        return (
            <Modal
                title={this.title}
                visible={visible}
                width={500}
                onOk={this.submit}
                onCancel={this.onCancel}
                footer={
                    <Button type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
                }
            >

                <Form className={styles.templateModal}>

                    <FormItem {...formItemLayout} label="Status">
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: 'Required'
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

                    <FormItem {...formItemLayout} label="Template Name">
                        {getFieldDecorator('template_name', {
                            initialValue: template_name,
                            rules: [
                                {
                                    required: true, message: 'Required'
                                }
                            ]
                            // disabled={!this.typeIsAdd}
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="Template">
                        {getFieldDecorator('template_url', {
                            initialValue: template_url,
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
                                <Icon type="iconguanbi" onClick={() => this.removeFile('template_url')} />
                            </div>)
                        )
                        }
                    </FormItem>

                    <FormItem {...formItemLayout} label="Template Image">
                        {getFieldDecorator('template_image', {
                            initialValue: template_image,
                            rules: [
                                {
                                    required: true, message: 'Required'
                                }
                            ]
                        })(
                            !imageName ? (<Upload {...imageProps}>
                                <Button>
                                    <Icon type="iconshangchuan1" /> Upload Image
                                    </Button>
                            </Upload>) : (<div>
                                <span style={{ marginRight: 10 }}>{imageName}</span>
                                <Icon type="iconguanbi" onClick={() => this.removeFile('template_image')} />
                            </div>)
                        )
                        }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

export default Form.create<IProps>()(EndcardTemplateModal)
