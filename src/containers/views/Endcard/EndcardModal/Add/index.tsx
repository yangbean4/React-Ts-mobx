import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber, Icon as AntIcon, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '@config/web'
import { ComponentExt } from '@utils/reactExt'
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
        lg: { span: 3 }
    },
    wrapperCol: {
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
    optionListDb: IEndcardStore.OptionListDb
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
    private platform: string

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
    get isAdd() {
        return !this.props.endcardId
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
                        if (this.isAdd) {
                            let data = await createEndcard(values)
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
    }

    @action
    getDetail = async () => {
        const res = await this.api.appGroup.getAppGroupInfo({ id: this.props.endcardId })
        runInAction('SET_APPGroup', () => {
            this.endcardTarget = { ...res.data }
        })
    }

    @action
    removeFile = () => {
        runInAction('SET_URL', () => {
            this.logo = ''
        })
        this.props.form.setFieldsValue({
            logo: ''
        })
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

        const props = {
            showUploadList: false,
            accept: ".png, .jpg, .jpeg, .gif",
            name: 'file',
            // listType: "picture",
            className: "avatar-uploader",
            onRemove: this.removeFile,
            // beforeUpload: (file) => {
            //     const isHtml = file.type === 'text/html';
            //     if (!isHtml) {
            //         message.error('Upload failed! The file must be in HTML format.');
            //     }
            //     const isLt2M = file.size / 1024 / 1024 < 2;
            //     if (!isLt2M) {
            //         message.error('Image must smaller than 2MB!');
            //     }
            //     return isHtml && isLt2M;
            // },
            customRequest: (data) => {
                const formData = new FormData()
                formData.append('file', data.file)
                this.api.appGroup.uploadIcon(formData).then(res => {
                    const logo = res.data.url
                    this.props.form.setFieldsValue({
                        logo: logo
                    })

                    const fileRender = new FileReader()
                    fileRender.onload = (ev) => {
                        const target = ev.target as hasResult
                        runInAction('SET_URL', () => {
                            this.logo = target.result;
                        })
                    }
                    fileRender.readAsDataURL(data.file)
                }, this.removeFile).catch(this.removeFile)
            }
        }


        const {
            platform = 'android',
            app_id = '',
            version = "",
            order_id = '',
            endcard_name = '',
            language = '',
            template_id = this.useAppWall,
            endcard_image_url = '',
            cta = '',
            cta_text_col = "",
            cta_bkgd = '',
            cta_edge = '',
            cta_pic = '',
            automatic_jump = '',
            is_show = '',
            status = 1,
        } = this.endcardTarget
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
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.usePkgnameData.map(c => (
                                    <Select.Option value={c} key={c}>
                                        {c}
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
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Order ID"  >
                        {getFieldDecorator('order_id', {
                            initialValue: order_id,
                        })(<Input />)}
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
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {optionListDb.language.map(c => (
                                <Select.Option key={c} value={c}>
                                    {c}
                                </Select.Option>
                            ))}
                        </Select>)}
                    </FormItem>

                    <FormItem label="VC Callback Url"  >
                        {getFieldDecorator('endcard_name', {
                            initialValue: endcard_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
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
                                        <div className={styles.imgBox} style={{ backgroundImage: 'url(' + c.template_url + ')' }}></div>
                                        <Radio value={c.id}>
                                            {c.id}
                                        </Radio>
                                    </div>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>


                    <FormItem label="Icon">
                        {getFieldDecorator('Cover Image', {
                            initialValue: endcard_image_url,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Upload {...props}>
                                {this.logo || endcard_image_url ? <img style={{ width: '100px' }} src={this.logo || endcard_image_url} alt="avatar" /> : null
                                    // <AntIcon className={styles.workPlus} type='plus' />
                                }
                            </Upload>
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
