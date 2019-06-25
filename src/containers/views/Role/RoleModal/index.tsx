import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Button, message, Tree } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
const { TreeNode } = Tree
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
    role?: IRoleStore.IRole
    createRole?: (role: IRoleStore.IRole) => Promise<any>
    modifyRole?: (role: IRoleStore.IRole) => Promise<any>
    routerStore?: RouterStore
    permissionTree?: IPermissionStore.IPermissionTree[]
    getPermissionTree?: () => Promise<any>
    initEditRule?: (data) => Promise<any>
    clearEditRole?: () => void
    clearPermissionTree?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { roleStore, routerStore, permissionStore } = store
        const { clearPermissionTree, permissionTree, getPermissionTree } = permissionStore
        const { clearEditRole, role, createRole, modifyRole, initEditRule } = roleStore
        return { clearPermissionTree, clearEditRole, initEditRule, getPermissionTree, permissionTree, routerStore, role, createRole, modifyRole }
    }
)
@observer
class RoleModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private checkedKeys: string[]

    private typeIsAdd: boolean = true


    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, getPermissionTree, initEditRule } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        if (!isNaN(Number(routerId))) {
            initEditRule({ id: routerId })
            this.typeIsAdd = false
        }
        getPermissionTree()
    }

    componentWillUnmount() {
        this.props.clearPermissionTree()
        this.props.clearEditRole()
    }

    onCheck = (checkedKeys) => {
        runInAction('UP_CHECK', () => {
            this.checkedKeys = checkedKeys
        })
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, role, createRole, modifyRole, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = { message: '' }
                        let par = { ...values, permission: this.checkedKeys ? this.checkedKeys.join(',') : role ? role.permission : [] }
                        if (this.typeIsAdd) {
                            data = await createRole(par)
                        } else {
                            data = await modifyRole({ ...par, id: role.id })
                        }
                        message.success(data.message)
                        routerStore.push('/role')
                    } catch (err) {
                        //console.log(err)
                    }
                    this.toggleLoading()
                }
            }
        )
    }
    Cancel = () => {
        this.props.routerStore.push('/role')
    }

    renderTreeNodes = (data: IPermissionStore.IPermissionTree[]) => data.map((item) => {
        if (item.children) {
            return (
                <TreeNode title={item.name} key={`${item.id}`}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={item.name} key={`${item.id}`} />
    })

    render() {
        const { role, form, permissionTree } = this.props
        const { getFieldDecorator } = form
        const {
            role_name = '',
            permission = '',
            remarks = ''
        } = role || {}
        const arr = this.checkedKeys || permission.split(',').filter(ele => !!ele)
        return (
            <div className='sb-form'>
                <Form className={styles.roleModal} >
                    <FormItem {...formItemLayout} label="Role Name">
                        {getFieldDecorator('role_name', {
                            initialValue: role_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label='Authorization'>
                        {permissionTree && permissionTree.length
                            ? <Tree
                                checkable
                                defaultExpandAll
                                checkedKeys={arr}
                                onCheck={this.onCheck}
                            >{this.renderTreeNodes(permissionTree)}</Tree>
                            : 'loading tree'}
                    </FormItem>

                    <FormItem {...formItemLayout} label="Remarks">
                        {getFieldDecorator('remarks', {
                            initialValue: remarks,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()} >Cancel</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create<IProps>()(RoleModal)
