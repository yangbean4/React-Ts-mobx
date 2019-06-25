import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
// 封装表单域组件
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

interface IProps extends IStoreProps {
    type?: string
    onOk?: (id: string) => void
}
interface IStoreProps {
    company?: ICompanyStore.ICompany
    createCompany?: (company: ICompanyStore.ICompany) => Promise<any>
    modifyCompany?: (company: ICompanyStore.ICompany) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    clearCompany?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { companyStore, routerStore } = store
        const { company, createCompany, modifyCompany, clearCompany} = companyStore
        return { clearCompany, company, routerStore, createCompany, modifyCompany}
    }
)
@observer
class CompanyModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @computed
    get typeIsAdd() {
        return !this.props.company || !this.props.company.id
    }

    @computed
    get formItemLayout() {
        return this.props.type ? formItemLayoutForModel : formItemLayout
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, company = {}} = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!company.id || company.id !== Id)) && !this.props.type) {
            routerStore.push('/companysource')
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
                            type: 0,
                            ...values,
                        }
                        if (this.typeIsAdd) {
                            data = await createCompany(values)
                        } else {
                            data = await modifyCompany({ ...values, id: company.id })
                        }
                        message.success(data.message)
                        if (this.props.type) {
                            this.props.onOk(data.data.id);
                            this.props.form.resetFields()
                        } else {
                            routerStore.push('/companysource')
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
            address = '' ,
            phone = '',
            email = '',
        } = company || {}
        return (
            <div className='sb-form'>
                <Form className={styles.CompanyModal} {...this.formItemLayout}>
                    <FormItem  label="Source Company">
                        {getFieldDecorator('company_name', {
                            initialValue: company_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Full Name of Source Company" >
                        {getFieldDecorator('company_full_name', {
                            initialValue: company_full_name,
                            rules: [                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem  label="Address">
                        {getFieldDecorator('address', {
                            initialValue: address,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                    <FormItem  label="Email">
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
                    <FormItem  label="Phone">
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
                    <FormItem className={this.props.type? styles.modalBtn :styles.btnBox} >
                        <Button className={this.props.type? styles.btn : ''} type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CompanyModal)
