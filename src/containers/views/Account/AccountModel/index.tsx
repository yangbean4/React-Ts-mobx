import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Select, Radio, Button, message } from 'antd'
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
const allRole = [
    {
        role_name: 'Publisher',
        id: 1
    }
]

interface IProps {
    account?: IAccountStore.IAccount
    createAccount?: (account: IAccountStore.IAccount) => Promise<any>
    modifyAccount?: (account: IAccountStore.IAccount) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    // allRole?: IRoleStore.RoleOption[]
    clearAccount?: () => void
}

@inject(
    (store: IStore): IProps => {
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
    private companyShow: boolean = false

    @computed
    get typeIsAdd() {
        return !this.props.account || !this.props.account.id
    }

    @computed
    get accountType() {
        return this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
    }

    @computed
    get typeName() {
        return `${camelCase(this.accountType)} Company`
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    toggleCompanyShow = (type?: boolean) => {
        this.companyShow = type === undefined ? !this.companyShow : type
    }

    @action
    getAllCompany = async () => {
        const res = await this.api.account.getAllCompany()
        runInAction('set_all_co', () => {
            this.allCompany = res.data
        })
    }

    companyModelOk = async (id: string) => {
        await this.getAllCompany()
        this.props.form.setFieldsValue({
            company: id
        })
    }

    componentWillMount() {
        const { routerStore, account = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!account.id || account.id !== Id))) {
            routerStore.push(`/account/${this.accountType}`)
        } else {
            this.getAllCompany()
        }
    }
    componentWillUnmount() {
        this.props.clearAccount()
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
                        let data = { message: '' }
                        values = {
                            ...values,
                            role: values.role.join(',')
                        }
                        if (this.typeIsAdd) {
                            data = await createAccount(values)
                        } else {
                            data = await modifyAccount({ ...values, id: account.id })
                        }
                        message.success(data.message)
                        routerStore.push('/accounts')
                    } catch (err) {
                        //console.log(err);
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
            role_id = 1,
            company = undefined
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
                    <Form className={styles.accountModal} >
                        <FormItem {...formItemLayout} label="User Name">
                            {getFieldDecorator('user_name', {
                                initialValue: user_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input disabled={!this.typeIsAdd} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="Password">
                            {getFieldDecorator('password', {
                                rules: this.typeIsAdd ? [
                                    {
                                        required: true, message: "Required"
                                    }
                                ] : undefined
                            })(<Input />)}
                        </FormItem>

                        <FormItem {...formItemLayout} label={this.typeName}>
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
                            <Icon className={styles.workBtn} onClick={() => this.toggleCompanyShow(true)} key='iconxinzeng1' type='iconxinzeng1' />
                        </FormItem>

                        <FormItem {...formItemLayout} label="Role Name">
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
                                    {allRole.map(c => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.role_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="Status">
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
                        <FormItem className={styles.btnBox}>
                            <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                            <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                        </FormItem>
                    </Form>
                </div>
            </React.Fragment>

        )
    }
}

export default Form.create<IProps>()(AccountModal)
