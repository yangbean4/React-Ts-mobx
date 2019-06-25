import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message, Popover, Icon as AntIcon } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import { camelCase } from '@utils/index'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import CompanyModel from './CompanyModel'
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
const formItemLayoutForModel = {
    labelCol: {
        lg: { span: 7 },
    },
    wrapperCol: {
        lg: { span: 13 }
    }
}

interface IpropsStore {
    account?: IAccountStore.IAccount
    createAccount?: (account: IAccountStore.IAccount) => Promise<any>
    modifyAccount?: (account: IAccountStore.IAccount) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    // allRole?: IRoleStore.RoleOption[]
    clearAccount?: () => void
}

interface IProps extends IpropsStore {
    type?: string
    info?: string
    onOk?: (id: number) => void
    onCancel?: () => void
}

@inject(
    (store: IStore): IpropsStore => {
        const { accountStore, routerStore } = store
        const { account, createAccount, modifyAccount, clearAccount } = accountStore
        return { clearAccount, routerStore, account, createAccount, modifyAccount }
    }
)
@observer
class AccountModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private allCompany: ICompanyStore.ICompany[] = []

    @observable
    private accountTypeOption: any[] = []

    @observable
    private companyShow: boolean = false

    @computed
    get typeIsAdd() {
        return !this.props.account || !this.props.account.id
    }

    @computed
    get formItemLayout() {
        return this.props.type ? formItemLayoutForModel : formItemLayout
    }

    @computed
    get routerParam() {
        const param = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        return param
    }

    @computed
    get accountType() {
        const ret = !this.props.type ? this.routerParam : this.props.type
        return ret
    }

    @computed
    get allRole() {
        return this.accountType === 'source' ? [
            {
                role_name: 'Advertiser',
                id: 1
            }
        ] : [
                {
                    role_name: 'Publisher',
                    id: 2
                }
            ]
    }

    @computed
    get typeName() {
        return `${this.props.type ? this.props.type : camelCase(this.accountType)} Company`
    }

    // @computed
    // get infoName() {
    //     return `${this.props.info ? this.props.info: ''} Company`
    // }

    // @computed
    // get chanageName() {
    //     return this.props.info ? this.infoName : this.typeName
    // }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    toggleCompanyShow = (type?: boolean) => {
        this.companyShow = type === undefined ? !this.companyShow : type
    }

    @action
    getAccountTypeOption = async () => {
        const res = await this.api.account.accountTypeList();
        runInAction('set_all_co', () => {
            this.accountTypeOption = res.data
        })
    }

    @action
    getAllCompany = async () => {
        const res = await this.api.account.getAllCompany({
            type: this.accountType === 'source' ? 0 : 1
        })
        runInAction('set_all_co', () => {
            this.allCompany = res.data
        })
    }

    companyModelOk = async (id: string) => {
        await this.getAllCompany() // 获取公司列表
        this.props.form.setFieldsValue({// 重新赋值
            company: id
        })
        this.toggleCompanyShow(false)
    }

    componentWillMount() {
        const { routerStore, account = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if (!this.props.type && (!isNaN(Id) && (!account.id || account.id !== Id))) {
            routerStore.push(`/account/${this.accountType}`)
        } else {
            this.getAllCompany()
            this.getAccountTypeOption()
        }
    }
    componentWillUnmount() {
        this.props.clearAccount()
    }
    componentDidMount() {
        console.log(this.props.type)
        console.log(this.accountType)
        console.log(this.typeName)
    }
    Cancel = () => {
        this.props.routerStore.push(`/account/${this.accountType}`)
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, account, createAccount, modifyAccount, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        this.props.type ? (values.status = 1) : values.status // 弹窗提交默认给status添加状态为1
                        let data = { message: '', data: { id: 1 } }
                        if (this.typeIsAdd) {
                            data = await createAccount(values)
                        } else {
                            data = await modifyAccount({ ...values, id: account.id })
                        }
                        message.success(data.message)
                        !this.props.type ? this.Cancel() : this.props.onOk(data.data.id)
                        if (this.props.type) {
                            this.props.form.resetFields()
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { account, form } = this.props
        const { getFieldDecorator } = form
        const {
            user_name = '',
            status = 1,
            role_id = this.allRole[0].id,
            company_id: company = undefined,
            account_type = undefined
        } = account || {}

        return (
            <React.Fragment>
                <CompanyModel
                    visible={this.companyShow}
                    type={this.accountType}
                    onCancel={() => this.toggleCompanyShow(false)}
                    onOk={(id) => this.companyModelOk(id)}
                />
                <div className='sb-form'>
                    <Form className={styles.accountModal} {...this.formItemLayout}>
                        <FormItem label="User Name">
                            {getFieldDecorator('user_name', {
                                initialValue: user_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                        </FormItem>
                        <FormItem label="Password">
                            {getFieldDecorator('password', {
                                rules: this.typeIsAdd ? [
                                    {
                                        required: true, message: "Required"
                                    }
                                ] : undefined
                            })(<Input autoComplete="off" />)}

                            <Popover content={(<p>It is recommended that passwords contain <br /> both upper and lower case letters and Numbers.</p>)}>
                                <AntIcon className={styles.workBtn} type="question-circle" />
                            </Popover>
                        </FormItem>

                        <FormItem label={this.typeName.trim() == 'Subsite Company' ? 'Subsite Company' : this.typeName}>
                            {getFieldDecorator('company', {
                                initialValue: company,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.allCompany.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.company_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                            {
                                !this.props.type && < Icon className={styles.workBtn} onClick={() => this.toggleCompanyShow(true)} key='iconxinzeng1' type='iconxinzeng1' />
                            }
                        </FormItem>

                        <FormItem label="Role Name">
                            {getFieldDecorator('role_id', {
                                initialValue: role_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    allowClear
                                    showSearch
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.allRole.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.role_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        {
                            this.accountType === 'source' && <FormItem label="Account Type">
                                {getFieldDecorator('account_type', {
                                    initialValue: account_type,
                                    rules: [
                                        {
                                            required: true, message: "Required"
                                        }
                                    ]
                                })(
                                    <Select
                                        allowClear
                                        showSearch
                                        getPopupContainer={trigger => trigger.parentElement}
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {this.accountTypeOption.map(c => (
                                            <Select.Option key={c.id} value={c.id}>
                                                {c.type_name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
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
                        <FormItem className={this.props.type ? styles.modalBtn : styles.btnBox}>
                            <Button type="primary" className={this.props.type ? styles.btn : ''} loading={this.loading} onClick={this.submit}>Submit</Button>
                            {
                                !this.props.type && <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                            }
                        </FormItem>
                    </Form>
                </div>
            </React.Fragment>

        )
    }
}

export default Form.create<IProps>()(AccountModal)
