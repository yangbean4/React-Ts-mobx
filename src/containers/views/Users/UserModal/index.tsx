import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Select, Radio, Button, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption } from '../web.config'
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

interface IProps {
    user?: IUserStore.IUser
    createUser?: (user: IUserStore.IUser) => Promise<any>
    modifyUser?: (user: IUserStore.IUser) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    allRole?: IRoleStore.RoleOption[]
    getAllRoles?: () => Promise<any>
    clearRolesAll?: () => void
    clearUser?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { userStore, routerStore, roleStore } = store
        const { user, createUser, modifyUser, clearUser } = userStore
        const { getAllRoles, allRole, clearRolesAll } = roleStore
        return { clearUser, clearRolesAll, getAllRoles, allRole, routerStore, user, createUser, modifyUser }
    }
)
@observer
class UserModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @computed
    get typeIsAdd() {
        return !this.props.user || !this.props.user.id
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, user = {}, getAllRoles } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!user.id || user.id !== Id))) {
            routerStore.push('/users')
        } else {
            getAllRoles()
        }
    }
    componentWillUnmount() {
        this.props.clearRolesAll()
        this.props.clearUser()
    }
    Cancel = () => {
        this.props.routerStore.push('/users')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, user, createUser, modifyUser, form } = this.props
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
                            data = await createUser(values)
                        } else {
                            data = await modifyUser({ ...values, id: user.id })
                        }
                        message.success(data.message)
                        routerStore.push('/users')
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { user, form, allRole } = this.props
        const { getFieldDecorator } = form
        let roleValue: (string | number)[] = []
        const {
            role = undefined,
            user_name = '',
            owner = '',
            status = 1,
        } = user || {}
        if (role && user) {
            roleValue = role.split(',').map(ele => {
                return (allRole.find(role => role.role_name === ele) || {}).id
            }).filter(ele => ele !== undefined)
        }
        return (
            <div className='sb-form'>
                <Form className={styles.userModal} >
                    <FormItem {...formItemLayout} label="User Name">
                        {getFieldDecorator('user_name', {
                            initialValue: user_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Password">
                        {getFieldDecorator('pwd', {
                            rules: this.typeIsAdd ? [
                                {
                                    required: true, message: "Required"
                                }
                            ] : undefined
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Owner">
                        {getFieldDecorator('owner', {
                            initialValue: owner,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="Role Name">
                        {getFieldDecorator('role', {
                            initialValue: roleValue,
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
                                mode='multiple'
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
        )
    }
}

export default Form.create<IProps>()(UserModal)
