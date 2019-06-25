import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Button, message, Col } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
// 封装表单域组件
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        lg: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
        lg: { span: 6 }
    }
}
const formItemLayoutForModel = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 10},
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 },
        lg: { span: 13 }
    }
}

interface IStoreProps {
    company?: ICompanyStore.ICompany
    createCompany?: (company: ICompanyStore.ICompany) => Promise<any>
    modifyCompany?: (company: ICompanyStore.ICompany) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    clearCompany?: () => void
}

interface IProps extends IStoreProps {
    type?: string
    onOk?: (id: string) => void
    onCancel?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { companyStore, routerStore } = store
        const { company, createCompany, modifyCompany, clearCompany } = companyStore
        return { clearCompany, company, routerStore, createCompany, modifyCompany }
    }
)
@observer
class CompanyModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @computed
    get formItemLayout() {
        return this.props.type ? formItemLayoutForModel : formItemLayout
    }

    @computed
    get buttonModalLayout() {
        return this.props.type ?  'btnBox' : ''
    }

    @computed
    get typeIsAdd() {
        return !this.props.company || !this.props.company.id
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, company = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!company.id || company.id !== Id)) && !this.props.type) {
            routerStore.push('/companysite')
        }
    }
    componentWillUnmount() {
        this.props.clearCompany()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, company, createCompany, modifyCompany, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = {
                            message: '',
                            data: {
                                id: ''
                            }
                        }
                        values = {
                            type: 1,
                            ...values,
                        }
                        if (this.typeIsAdd) {
                            data = await createCompany(values)
                        } else {
                            data = await modifyCompany({ ...values, id: company.id })
                        }
                        message.success(data.message)
                        if (this.props.type) {
                            this.props.onOk(data.data.id)
                            this.props.form.resetFields()
                        } else {
                            routerStore.push('/companysite')
                        }
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { company, form } = this.props
        const { getFieldDecorator } = form
        const {
            company_name = '',
            company_full_name = '',
            address = '',
            phone = '',
            email = '',
            beneficiary_name = '',
            bank_account_number = '',
            bank_swift_code = '',
            bank_address = '',
        } = company || {}
        return (
            <div className='sb-form'>
                <Form className={styles.CompanyModal} {...this.formItemLayout}>
                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>{`Company Info`}</span>
                        </div>
                    </Col>
                    <FormItem label="Subsite Company"  >
                        {getFieldDecorator('company_name', {
                            initialValue: company_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Full Name of Subsite Company" >
                        {getFieldDecorator('company_full_name', {
                            initialValue: company_full_name,
                            rules: [{
                                required: true, message: "Required"
                            }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Address" >
                        {getFieldDecorator('address', {
                            initialValue: address,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                    <FormItem label="Email" >
                        {getFieldDecorator('email', {
                            initialValue: email,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                                    message: 'please enter the correct email format!'
                                }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Phone" >
                        {getFieldDecorator('phone', {
                            initialValue: phone,
                            rules: [
                                {
                                    required: false, message: 'required'
                                },
                                {
                                    pattern: /^[1][3,4,5,7,8,9][0-9]{9}$/,
                                    message: 'Incorrect phone number format!'
                                }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <Col span={4} className={styles.companyTag}>
                        <div className={styles.tagWrapper}>
                            <span>{`Bank Info`}</span>
                        </div>
                    </Col>
                    <FormItem label="Beneficiary Name" >
                        {getFieldDecorator('beneficiary_name', {
                            initialValue: beneficiary_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Account Number" >
                        {getFieldDecorator('bank_account_number', {
                            initialValue: bank_account_number,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    pattern: /^[0-9]{14,19}$/,
                                    message: 'Incorrect bank account format!'
                                }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Swift Code" >
                        {getFieldDecorator('bank_swift_code', {
                            initialValue: bank_swift_code,
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    pattern: /^[0-9]*$/,
                                    message: 'number format'
                                }
                            ],
                            validateTrigger: 'onBlur'
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Address" >
                        {getFieldDecorator('bank_address', {
                            initialValue: bank_address,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                    <FormItem className={this.props.type? styles.modalBtn :styles.btnBox} >
                        <Button className={this.props.type? styles.btn : ''} type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CompanyModal)
