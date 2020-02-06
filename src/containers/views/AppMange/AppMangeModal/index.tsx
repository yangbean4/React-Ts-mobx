import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Modal, Popover, Icon as AntIcon, Upload, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption, screenOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import AccountModel from './AccountModel'
import KPI from './kpi';
import EventConfig from './eventConfig'

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
    appManage?: IAppManageStore.IAppMange
    getOptionListDb?: (id: number) => Promise<any>
    createAppManage?: (appManage: IAppManageStore.IAppMange) => Promise<any>
    modifyAppManage?: (appManage: IAppManageStore.IAppMange) => Promise<any>
    setAppManage?: (Apps: IAppManageStore.IAppMange) => void
    routerStore?: RouterStore
    userOption?: IAppGroupStore.UserOption
    getUserList?: () => Promise<any>
}

interface IProps extends IStoreProps {
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
}
@inject(
    (store: IStore): IProps => {
        const { appManageStore, routerStore, appGroupStore } = store
        const { getUserList, userOption } = appGroupStore

        const { createAppManage, modifyAppManage, getOptionListDb, optionListDb, setAppManage, appManage } = appManageStore
        return { getUserList, userOption, routerStore, createAppManage, modifyAppManage, getOptionListDb, optionListDb, setAppManage, appManage }
    }
)
@observer
class AppsManageModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private uploadLoading: boolean = false

    @observable
    private platform: boolean = false

    @observable
    private Account: ({ name?: string, id?: number })[] = []

    @observable
    private manageGroup: IAppManageStore.IAppMange = {}

    @observable
    private manageStore: IAppManageStore.IAppGplist = {}

    @observable
    private accountShow: boolean = false

    @observable
    private pkgnameData: any[] = []

    @observable
    private logo: string

    @observable
    private isAdd: boolean

    @observable
    private Id: number


    private validKpi: Function;

    private validEventConfig: Function;

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
    toggleUploadLoading = () => {
        this.uploadLoading = !this.uploadLoading
    }

    @action
    toggleAppShow = (type?: boolean) => {
        this.accountShow = type === undefined ? !this.accountShow : type
    }

    @action
    switchNumber = (obj, target = {}) => {
        const keys = Object.keys(obj)
        keys.forEach(() => {
            target['category_id'] = Number(obj['category_id'])
            target['frame_id'] = Number(obj['frame_id'])
            target['style_id'] = Number(obj['style_id'])
            target['specs_id'] = Number(obj['specs_id'])
        })
        return target
    }

    @action
    getDetail = async () => {
        const target = {}
        const res = await this.api.appsManage.modifyAppsManageInfo({ app_key: this.Id })
        const ret = Object.assign({}, res.data, this.switchNumber(res.data, target))
        this.props.setAppManage(res.data)
        runInAction('SET_APPManage', () => {
            this.manageGroup = ret
        })
    }

    @action
    getSourceAccount = async () => {
        const res = await this.api.appGroup.getAccountSource()
        runInAction('SET_SOURCE', () => {
            this.Account = res.data;
        })
    }

    runInit = () => {
        const location = this.props.routerStore.location;
        const isAdd = location.pathname.includes('add')
        let Id;
        if (!isAdd) {
            const routerId = location.pathname.split('/').pop()
            Id = Number(routerId)
        }
        runInAction('SET_StATE', () => {
            this.isAdd = isAdd;
            this.Id = Id
        })
    }

    companyModelOk = async (id: number) => {
        await this.getSourceAccount()
        this.props.form.setFieldsValue({// 重新赋值
            account_id: id
        })
        this.toggleAppShow(false)
    }

    Cancel = () => {
        this.props.type || !this.isAdd ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    getAppStoreInfo = async () => {
        const res = await this.api.appsManage.showGrabMessage({
            platform: this.props.form.getFieldValue('platform'),
            appstore_url: this.props.form.getFieldValue('appstore_url')
        })
        let del = res.data
        delete del.category_id
        runInAction('SET_APPGP', () => {
            this.manageStore = {
                ...del,
                // category_id: (this.props.optionListDb.Category.find(ele => ele.name === res.data.category_id) || {}).id
            }
        })
    }

    showModel = (values, cb, routerStore) => {
        Modal.confirm({
            title: 'Do you Want to change status enable to disable?',
            okText: 'YES',
            content: 'The status of the app is modified to disable, all campaigns under this app will be suspended',
            onOk() {
                cb(values).then(res => {
                    if (res.errorcode === 0) {
                        message.success(res.message)
                        routerStore.push('/offer')
                    }
                })
            },
            onCancel() {
                console.log('Cancel');
            }
        })
    }

    goBack = () => {
        this.props.history.goBack();
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }

        const { routerStore, createAppManage, form, modifyAppManage, type } = this.props

        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {

                    await this.validKpi();
                    await this.validEventConfig((...args) => {
                        console.error(args)
                    });

                    this.toggleLoading()
                    try {
                        let data = {
                            message: '',
                            data: {
                                id: ''
                            }
                        }
                        values.event_config = values.event_config && values.event_config.filter(v => v.source_name && v.event_type && v.event_name);
                        values = { ...values }
                        if (this.isAdd) {
                            data = await createAppManage(values)
                            message.success(data.message)
                            routerStore.push('/offer')
                        } else {
                            const cb = async () => {
                                data = await modifyAppManage({ ...values })
                                message.success(data.message)
                                routerStore.push('/offer')
                            }
                            if ((this.manageGroup.status !== values.status) && values.status === 'suspend') {
                                const resData = await this.api.appsManage.checkAppsStatus({ app_key: values.app_key.toString() })
                                const checkData = resData.data
                                if (checkData.errorcode !== 0) {
                                    // this.showModel(values, modifyAppManage, routerStore)
                                    this.$message.error('The status of the app is modified to disable, all campaigns under this app will be suspended')
                                } else {
                                    await cb()
                                }
                            } else {
                                await cb()
                            }

                        }
                        if (this.props.type) {
                            this.props.form.resetFields()
                        }
                    } catch (error) {
                        console.error(error)
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
        this.runInit()
        this.getSourceAccount()
        this.props.getUserList()
        this.props.getOptionListDb(this.Id)
        if (this.Id) {
            this.getDetail()
        }
        this.init()
    }

    @action
    removeFile = () => {
        runInAction('SET_URL', () => {
            this.logo = ''
            this.uploadLoading = false
        })
        this.props.form.setFieldsValue({
            logo: ''
        })
    }

    setValidKpi = (fn) => {
        this.validKpi = fn;
    }

    setValidEventConfig = (fn) => {
        this.validEventConfig = fn
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
                this.toggleUploadLoading();
                this.api.appGroup.uploadIcon(formData).then(res => {
                    const logo = res.data.url
                    this.props.form.setFieldsValue({
                        logo: logo
                    })
                    this.toggleUploadLoading();

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
        const { form, optionListDb, userOption } = this.props
        const data = this.manageGroup
        const reData = this.manageStore ? { ...data, ...this.manageStore } : data
        const { getFieldDecorator } = form
        const {
            platform = 'android',
            status = 'published',
            app_key = '',
            title = "",
            appstore_url = '',
            app_id = undefined,
            account_id = undefined,
            screen_type = '0',
            logo = '',
            kpi = null,
            rating = '',
            downloads = '',
            category_id = undefined,
            frame_id = 201,
            specs_id = undefined,
            style_id = 301,
            event_config = null,
            BD = '',
            AM = '',
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
                        <Col span={4} className={styles.companyTag}>
                            <div className={styles.tagWrapper}>
                                <span>Basic Info</span>
                            </div>
                        </Col>
                        {
                            !this.isAdd && <FormItem label="Appkey">
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

                        <FormItem label="Status">
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

                        <FormItem label="Platform">
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
                                        disabled={!this.isAdd}
                                        getPopupContainer={trigger => trigger.parentElement}
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


                        <FormItem label="Appstore Url">
                            {getFieldDecorator('appstore_url', {
                                initialValue: appstore_url,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={!this.isAdd} />)}<Button type="primary" onClick={this.getAppStoreInfo} className={styles.importBtn}>Import</Button>
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
                                <Upload {...props} disabled={(!!this.manageStore.logo) || (!this.isAdd && !!logo)}>
                                    {this.logo || logo ? <img style={{ width: '100px' }} src={this.logo || logo} alt="avatar" />
                                        : <AntIcon className={styles.workPlus} type={this.uploadLoading ? 'loading' : 'plus'} />}
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
                            })(<Input autoComplete="off" disabled={!this.isAdd} />)}
                        </FormItem>

                        <FormItem label="App Name">
                            {getFieldDecorator('title', {
                                initialValue: title,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={!this.isAdd} />)}
                        </FormItem>

                        <FormItem label="Rate">
                            {getFieldDecorator('rating', {
                                initialValue: rating,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" />)}
                        </FormItem>
                        <FormItem label="Download">
                            {getFieldDecorator('downloads', {
                                initialValue: downloads,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" />)}
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
                                // disabled={!this.isAdd}
                                getPopupContainer={trigger => trigger.parentElement}
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
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
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
                                    }
                                ]
                            })(<Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
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
                            {getFieldDecorator('style_id', {
                                initialValue: style_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                getPopupContainer={trigger => trigger.parentElement}
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
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
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
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Select
                                showSearch
                                disabled={!this.isAdd}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.Account && this.Account.map(c => (
                                    <Select.Option key={c.id} value={c.id}>
                                        {c.name}
                                    </Select.Option>
                                ))}
                            </Select>)}
                            <Icon className={!this.isAdd ? styles.hidden : styles.uploadICON} onClick={() => this.toggleAppShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                        </FormItem>

                        <FormItem label="BD">
                            {getFieldDecorator('BD', {
                                initialValue: BD,
                                // rules: [
                                //   {
                                //     required: true, message: "Required"
                                //   }
                                // ]
                            })(
                                <Select
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {userOption.BD.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="AM">
                            {getFieldDecorator('AM', {
                                initialValue: AM,
                                // rules: [
                                //   {
                                //     required: true, message: "Required"
                                //   }
                                // ]
                            })(
                                <Select
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {userOption.AMSource.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>

                        {getFieldDecorator('kpi', {
                            initialValue: kpi,
                        })(<KPI valid={this.setValidKpi}></KPI>)}

                        {getFieldDecorator('event_config', {
                            initialValue: event_config,
                        })(<EventConfig valid={this.setValidEventConfig}></EventConfig>)}


                        <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                            <Button onClick={this.goBack} style={{ marginLeft: 10 }}>Cancel</Button>
                        </FormItem>
                    </Form>

                </div>
            </React.Fragment >
        )
    }
}

export default Form.create<IProps>()(AppsManageModal)
