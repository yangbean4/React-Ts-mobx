import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, InputNumber, Upload, Icon as AntIcon, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '../../web.config'
import { ComponentExt } from '@utils/reactExt'
import AccountModel from './AccountModel'
import * as styles from './index.scss'
import Icon from '@components/Icon'

const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 4 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        lg: { span: 5 }
    }
}
const minLayout = {
    labelCol: {
        lg: { span: 12 }
    },
    wrapperCol: {
        lg: { span: 12 }
    }
}


const getKey = (key: string): string => {
    return `preload_${key.split(' ')[0].toLowerCase()}_num`
}

interface hasResult {
    result?: string
}

interface IStoreProps {
    modifyAppGroup?: (appGroup: IAppGroupStore.IAppGroup) => Promise<any>
    createAppGroup?: (appGroup: IAppGroupStore.IAppGroup) => Promise<any>
    getOptionListDb?: (id: number) => Promise<any>
    getAccount?: () => Promise<any>
    optionListDb?: IAppGroupStore.OptionListDb
    routerStore?: RouterStore
    type?: string
    setAppGroup?: (Apps: IAppGroupStore.IAppGroup) => void
}

interface IProps extends IStoreProps {
    Id?: number
    onCancel?: () => void
    isAdd?: boolean
    onSubmit?: (data?: number) => void
}
@inject(
    (store: IStore): IStoreProps => {
        const { appGroupStore, routerStore } = store
        const { createAppGroup, getAccount, getOptionListDb, optionListDb, modifyAppGroup, setAppGroup } = appGroupStore
        return { routerStore, getAccount, createAppGroup, getOptionListDb, optionListDb, modifyAppGroup, setAppGroup }
    }
)
@observer
class AppGroupModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private appGroup: IAppGroupStore.IAppGroup = {}

    @observable
    private allSenAccount: IAppGroupStore.IAppGroup[] = []

    @observable
    private accountShow: boolean = false

    @observable
    private logo: string

    @observable
    private platform: string

    @computed
    get usePlatform() {
        return this.platform || this.appGroup.platform || 'android'
    }

    @observable
    private not_in_appstore: boolean

    @computed
    get useNot_in_appstore() {
        const arr = [this.not_in_appstore, !this.appGroup.not_in_appstore, true]
        return arr.find(ele => ele !== undefined)
    }

    @observable
    private pidType: boolean

    @computed
    get usePidType() {
        return [this.pidType, !!this.appGroup.contains_native_s2s_pid_types, false].find(ele => ele !== undefined)
    }

    @action
    toggleAppShow = (type?: boolean) => {
        this.accountShow = type === undefined ? !this.accountShow : type
    }

    @computed
    get isAdd() {
        return this.props.isAdd
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    inAppstoreChange = (e) => {
        const value = e.target.value
        runInAction('set_STore', () => {
            this.not_in_appstore = !value
        })
        if (value) {
            setImmediate(() => {
                this.props.form.setFieldsValue({
                    pkg_name: ''
                })
            })
        }
    }

    @action
    pidTypeChange = (e) => {
        const value = e.target.value
        if (!value) {
            this.props.form.setFieldsValue({
                pkg_name: ''
            })
        }
        runInAction('set_STore', () => {
            this.pidType = !!value
        })
    }

    @action
    platformChange = value => {
        this.platform = value
    }


    Cancel = () => {
        this.isAdd ? this.props.routerStore.push('/apps') : this.props.onCancel()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { modifyAppGroup, createAppGroup, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        values = { ...values, nations: (values.nations || []).join(',') }
                        if (!this.props.Id) {
                            const res = await createAppGroup(values)
                            this.props.onSubmit(res.data.id)
                        } else {
                            await modifyAppGroup({ ...values, id: this.props.Id })
                            this.props.onSubmit()
                        }
                    } catch (err) {
                        console.log(err)
                    }
                    this.toggleLoading()
                }
            }
        )
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

    @action
    getDetail = async () => {
        const res = await this.api.appGroup.getAppGroupInfo({ id: this.props.Id })
        const data = {
            ...res.data,
            nations: res.data.nations ? res.data.nations.split(',') : []
        }
        this.props.setAppGroup(data)
        runInAction('SET_APPGroup', () => {
            this.appGroup = {
                ...data
            }
        })
    }


    companyModelOk = async (id: number) => {
        await this.props.getAccount()
        this.props.form.setFieldsValue({// 重新赋值
            account_id: id
        })
        this.toggleAppShow(false)
    }


    componentWillMount() {
        this.props.getOptionListDb(this.props.Id)
        if (this.props.Id) {
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
        const reData = this.appGroup
        const {
            status = 1,
            platform = 'android',
            not_in_appstore = 0,
            pkg_name = '',
            app_name = "",
            logo = '',
            spec = undefined,
            category = undefined,
            frame = undefined,
            style = undefined,
            bundle_id = '',
            screen_type = 0,
            apply_screen_type = 0,
            account_id = undefined,
            // preload_ige_num = undefined,
            // preload_video_num,
            // preload_playicon_num,
            // recover_num,
            is_block = 0,
            recover_flag = undefined,
            contains_native_s2s_pid_types = 0,
            sdk_token = '',
            s2s_token = '',
            dev_id = '',
            ad_type = 0,
            offer_limit = '',
            nations = []
        } = reData
        return (
            <React.Fragment>
                <AccountModel
                    visible={this.accountShow}
                    onCancel={() => this.toggleAppShow(false)}
                    onOk={(id) => this.companyModelOk(id)}
                />
                <div className='sb-form'>
                    <Form  {...formItemLayout} className={styles.appForm}>
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
                                    {web.statusOption.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                            <Popover content={(<p>Adjust to disable status, may reduce revenue.</p>)}>
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
                                        disabled={!this.isAdd}
                                        onChange={this.platformChange}
                                        showSearch
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {web.platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>

                        <FormItem label="In the App Store">
                            {getFieldDecorator('not_in_appstore', {
                                initialValue: not_in_appstore,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group
                                    onChange={this.inAppstoreChange}
                                >
                                    {web.YesOrNo.map(c => (
                                        <Radio disabled={c.value && !this.isAdd && !not_in_appstore} key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>
                        {
                            !this.useNot_in_appstore && this.usePlatform === 'ios' ? <FormItem label='Bundle Id'>
                                {getFieldDecorator('bundle_id', {
                                    initialValue: bundle_id,
                                    // validateTrigger: 'onBlur',
                                    rules: [
                                        {
                                            required: true, message: "Required",
                                        },
                                    ]
                                })(<Input autoComplete="off" disabled={!this.isAdd && !!bundle_id} />)}
                            </FormItem> : <FormItem label="Pkg Name">
                                    {getFieldDecorator('pkg_name', {
                                        initialValue: pkg_name,
                                        // validateTrigger: 'onBlur',
                                        rules: [
                                            {
                                                required: true, message: "Required",
                                            },
                                            // {
                                            //     validator: (r, v, callback) => {
                                            //         const reg = this.usePlatform === 'android' ? /^com./ : /^[0-9]*$/
                                            //         if (!reg.test(v)) {
                                            //             const msg = this.usePlatform === 'android'
                                            //             callback('Pkgname for android /Ios platform should start with com.xxx/number!')
                                            //         }
                                            //         callback()
                                            //     }
                                            // }
                                        ]
                                        //  disabled={!this.useNot_in_appstore || (!this.isAdd && !!pkg_name)}
                                    })(<Input autoComplete="off" disabled={!this.isAdd && !!pkg_name} />)}
                                </FormItem>
                        }


                        <FormItem label="App Name">
                            {getFieldDecorator('app_name', {
                                initialValue: app_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" />)}
                            <Popover content={(<p>Enter a temporary app name if the app is not in the app store.</p>)}>
                                <AntIcon className={styles.workBtn} type="question-circle" />
                            </Popover>
                        </FormItem>

                        <FormItem label="Icon">
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

                        <FormItem label="Spec">
                            {getFieldDecorator('spec',
                                {
                                    initialValue: spec,
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
                                        {optionListDb.Spec.map(c => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem label="Category">
                            {getFieldDecorator('category',
                                {
                                    initialValue: category,
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
                                        {optionListDb.Category.map(c => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem label="Frame">
                            {getFieldDecorator('frame',
                                {
                                    initialValue: frame,
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
                                        {optionListDb.Frame.map(c => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem label="Style">
                            {getFieldDecorator('style',
                                {
                                    initialValue: style,
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
                                        {optionListDb.Style.map(c => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
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
                                    {web.screenType.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>
                        <FormItem label="Apply Screen Type">
                            {getFieldDecorator('apply_screen_type', {
                                initialValue: apply_screen_type,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group>
                                    {web.screenType.map(c => (
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
                            })(
                                <Select
                                    showSearch
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {optionListDb.Account.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                            <Icon className={styles.uploadICON} onClick={() => this.toggleAppShow(true)} type="iconxinzeng1" key="iconxinzeng1" />
                        </FormItem>
                        <FormItem label='Preload Number'>
                            {
                                ['IGE', 'Video', 'Playicon', 'Recover Offer'].map(key => {
                                    const rowKey = getKey(key)
                                    return (
                                        <FormItem key={key} {...minLayout} label={key}>
                                            {getFieldDecorator(rowKey, {
                                                initialValue: reData[rowKey],
                                                // validateTrigger: 'blur',
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
                                        </FormItem>
                                    )
                                })
                            }
                        </FormItem>

                        <FormItem label="Blacklist">
                            {getFieldDecorator('is_block', {
                                initialValue: is_block,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group>
                                    {web.isBlock.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                            <Popover content={(<p>No conversion has occurred in the past n days,no longer release advertisements to the user.</p>)}>
                                <AntIcon className={styles.workBtn} type="question-circle" />
                            </Popover>
                        </FormItem>
                        <FormItem label="Recover Flag">
                            {getFieldDecorator('recover_flag', {
                                initialValue: recover_flag,
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
                                    {web.recoverFlag.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>

                        <FormItem label="Contains Native s2s PID Types" className={styles.longLabel}>
                            {getFieldDecorator('contains_native_s2s_pid_types', {
                                initialValue: contains_native_s2s_pid_types,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Radio.Group
                                    disabled={!this.isAdd}
                                    onChange={this.pidTypeChange}
                                >
                                    {web.laji.map(c => (
                                        <Radio key={c.key} value={c.value}>
                                            {c.key}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        </FormItem>

                        <div style={{ marginLeft: '10%' }}>
                            <FormItem label="SDK Token">
                                {getFieldDecorator('sdk_token', {
                                    initialValue: sdk_token,
                                    rules: [
                                        {
                                            required: true, message: "Required",
                                        },
                                    ]
                                })(<Input autoComplete="off" />)}
                            </FormItem>
                            {
                                this.usePidType && <React.Fragment>
                                    <FormItem label="S2S Token">
                                        {getFieldDecorator('s2s_token', {
                                            initialValue: s2s_token,
                                            rules: [
                                                {
                                                    required: true, message: "Required",
                                                },
                                            ]
                                        })(<Input autoComplete="off" />)}
                                    </FormItem>

                                    <FormItem label="GEO">
                                        {getFieldDecorator('nations',
                                            {
                                                initialValue: nations,
                                                rules: [
                                                    {
                                                        required: true, message: "Required"
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    showSearch
                                                    mode="multiple"
                                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                >
                                                    {optionListDb.Country.map(c => (
                                                        <Select.Option key={c.id} value={c.code2}>
                                                            {c.code2}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            )}
                                    </FormItem>

                                    <FormItem label="Offer Limit">
                                        {getFieldDecorator('offer_limit', {
                                            initialValue: offer_limit,
                                            rules: [
                                                {
                                                    required: true, message: "Required",
                                                },
                                            ]
                                        })(<Input autoComplete="off" />)}
                                    </FormItem>
                                </React.Fragment>


                            }
                        </div>



                        <FormItem label="Subsite ID">
                            {getFieldDecorator('dev_id', {
                                initialValue: dev_id,
                                rules: [
                                    {
                                        required: true, message: "Required",
                                    },
                                ]
                            })(<Input autoComplete="off" disabled={!this.isAdd} />)}
                        </FormItem>



                        <FormItem label="AD Type">
                            {getFieldDecorator('ad_type', {
                                initialValue: ad_type,
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
                                    {web.adType.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem className={styles.btnBox}>
                            <Button type="primary" className={styles.submitBtn} loading={this.loading} onClick={this.submit}>Submit</Button>
                            <Button onClick={() => this.Cancel()}>Cancel</Button>
                        </FormItem>
                    </Form>

                </div>
            </React.Fragment>

        )
    }
}

export default Form.create<IProps>()(AppGroupModal)
