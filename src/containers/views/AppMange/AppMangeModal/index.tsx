import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Popover, Icon as AntIcon, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption, screenOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import AccountModel from './AccountModel'

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
    optionListDb?: IAppManageStore.OptionListDb
    getOptionListDb?: (id: number) => Promise<any>
    getAccount?: () => Promise<any>
    createAppManage?: (appManage: IAppManageStore.IAppMange) => Promise<any>
    modifyAppManage?: (appManage: IAppManageStore.IAppMange) => Promise<any>
    setAppManage?: (Apps: IAppManageStore.IAppMange) => void
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    appKey?: number
    onCancel?: () => void
    isAdd?: boolean
    onOk?: (id: number) => void
    type?: string
    onSubmit?: (data?: number) => void
}
@inject(
    (store: IStore): IProps => {
        const { appManageStore, routerStore } = store
        const { createAppManage, modifyAppManage, getAccount, getOptionListDb, optionListDb, setAppManage } = appManageStore
        return { routerStore, createAppManage, modifyAppManage, getOptionListDb, optionListDb, getAccount, setAppManage }
    }
)
@observer
class AppsManageModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private platform: boolean = false

    @observable
    private manageGroup: IAppManageStore.IAppMange = {}

    @observable
    private accountShow: boolean = false

    @observable
    private pkgnameData: any[] = []

    @observable
    private logo: string

    @computed
    get isAdd() {
        return this.props.isAdd
    }

    @computed
    get usePlatform() {
        return this.platform || 'android'
    }

    @computed
    get usePkgnameData() {
        return this.pkgnameData.filter(ele => ele.platform === this.usePlatform)
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    toggleAppShow = (type?: boolean) => {
        this.accountShow = type === undefined ? !this.accountShow : type
    }

    @action
    getDetail = async () => {
        const res = await this.api.appsManage.modifyAppsManageInfo({ app_key: this.props.appKey })
        this.props.setAppManage(res.data)
        runInAction('SET_APPManage', () => {
            this.manageGroup = { ...res.data }
        })
    }

    companyModelOk = async (id: number) => {
        await this.props.getAccount()
        this.props.form.setFieldsValue({// 重新赋值
            account_id: id
        })
        this.toggleAppShow(false)
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createAppManage, form, modifyAppManage, type } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        values = {...values}
                        if (!this.props.appKey) {
                            const res = await createAppManage(values)
                            this.props.onSubmit(res.data.id)
                        } else {
                            await modifyAppManage({ ...values })
                            this.props.onSubmit()
                        }
                    } catch (error) {
                        console.log(err)
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        const res = await this.api.appGroup.getPkgnameData()
        runInAction('set_LIST', () => {
            this.pkgnameData = res.data
        })
    }

    @action
    setPlatform = (type) => {
        this.platform = type
    }

    componentWillMount() {
        this.props.getOptionListDb(this.props.appKey)
        if (this.props.appKey) {
            this.getDetail()
        }
        this.init()
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

    render() {

        const props = {
            showUploadList: false,
            accept: ".png, .jpg, .jpeg, .gif",
            name: 'file',
            className: "avatar-uploader",
            onRemove: this.removeFile,
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
        const { form, optionListDb } = this.props
        const reData = this.manageGroup
        const { getFieldDecorator } = form
        const {
            platform = 'android',
            status = 1,
            app_key = '',
            app_name = "",
            appstore_url = '',
            app_id = '',
            account_id = '',
            screen_type = '',
            logo = '',
            rate = '',
            downloads = '',
            category_id = '',
            frame_id = '',
            specs_id = '',
            type_id = ''
        } = reData || {}
        return (
            <React.Fragment>
                <AccountModel
                    visible={this.accountShow}
                    onCancel={() => this.toggleAppShow(false)}
                    onOk={(id) => this.companyModelOk(id)}
                />
                <div className='sb-form'>
                    <Form {...this.props.type ? miniLayout : formItemLayout} className={styles.currencyModal} >
                        {
                            this.isAdd && <FormItem label="Appkey">
                                {getFieldDecorator('app_key', {
                                    initialValue: app_key,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<span>
                                    {app_key}
                                </span>)}
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
                                <Popover content={(<p>Adjust to disable status, all campaigns under this app will be suspended.</p>)}>
                                    <AntIcon className={styles.workBtn} type="question-circle" />
                                </Popover>
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

                            <FormItem label="Appstore Url">
                                {getFieldDecorator('appstore_url', {
                                    initialValue: appstore_url,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(<Input />)}<Button type="primary" className={styles.importBtn}>Import</Button>
                            </FormItem>

                        <FormItem label="Logo">
                            {getFieldDecorator('logo', {
                                initialValue: logo,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Upload {...props}>
                                    {this.logo || logo ? <img style={{ width: '100px' }} src={this.logo || logo} alt="avatar" /> : <AntIcon className={styles.workPlus} type='plus' />}
                                </Upload>
                            )}
                        </FormItem>

                        <FormItem label="App ID">
                            {getFieldDecorator('app_id', {
                                initialValue: app_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input disabled={this.platform} />)}
                        </FormItem>

                        <FormItem label="App Name">
                            {getFieldDecorator('app_name', {
                                initialValue: app_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input />)}
                        </FormItem>

                        <FormItem label="Rate">
                            {getFieldDecorator('rate', {
                                initialValue: rate,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input />)}
                        </FormItem>
                        <FormItem label="Download">
                            {getFieldDecorator('downloads', {
                                initialValue: downloads,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input />)}
                        </FormItem>

                        <FormItem label="Category">
                            {getFieldDecorator('category_id', {
                                initialValue: category_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.Category.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>

                        <FormItem label="Spec"  >
                            {getFieldDecorator('specs_id', {
                                initialValue: specs_id,
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.Spec.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>

                        <FormItem label="Frame">
                            {getFieldDecorator('frame_id', {
                                initialValue: frame_id,
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
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.Frame.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>

                        <FormItem label="Style"  >
                            {getFieldDecorator('type_id', {
                                initialValue: type_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.Style.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                        </FormItem>

                        <FormItem label="Screen Type">
                            {getFieldDecorator('screen_type', {
                                initialValue: screen_type,
                            })(
                                <Radio.Group>
                                    {screenOption.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>

                        <FormItem label="SEN Account">
                            {getFieldDecorator('account_id', {
                                initialValue: account_id,
                            })(<Select
                                showSearch
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.Account.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                            <Icon className={styles.uploadICON} onClick={() => this.toggleAppShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                        </FormItem>

                        <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        </FormItem>
                    </Form>

                </div>
            </React.Fragment>
        )
    }
}

export default Form.create<IProps>()(AppsManageModal)
