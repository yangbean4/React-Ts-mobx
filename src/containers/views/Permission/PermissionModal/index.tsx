import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Button, message, TreeSelect, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

const TreeNode = TreeSelect.TreeNode;
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
    permission?: IPermissionStore.IPermission
    createPermission?: (permission: IPermissionStore.IPermission) => Promise<any>
    modifyPermission?: (permission: IPermissionStore.IPermission) => Promise<any>
    routerStore?: RouterStore
    permissionTree?: IPermissionStore.IPermissionTree[]
    getPermissionTree?: () => Promise<any>
    clearEditPermission?: () => void
    clearPermissionTree?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { permissionStore, routerStore } = store
        const { clearPermissionTree, permissionTree, getPermissionTree } = permissionStore
        const { clearEditPermission, permission, createPermission, modifyPermission } = permissionStore
        return { clearPermissionTree, clearEditPermission, getPermissionTree, permissionTree, routerStore, permission, createPermission, modifyPermission }
    }
)
@observer
class PermissionModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @computed
    get typeIsAdd() {
        return !this.props.permission || !this.props.permission.id
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, getPermissionTree, permission } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if (!isNaN(Id) && (!permission.id || permission.id !== Id)) {
            routerStore.push('/permission')
        } else {
            getPermissionTree()
        }
    }

    componentWillUnmount() {
        this.props.clearPermissionTree()
        this.props.clearEditPermission()
    }


    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, permission, createPermission, modifyPermission, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = { message: '' }
                        delete values.level;
                        values = { ...values, pid: values.pid || 0 }
                        if (this.typeIsAdd) {
                            data = await createPermission(values)
                        } else {
                            data = await modifyPermission({ ...values, id: permission.id })
                        }
                        message.success(data.message)
                        routerStore.push('/permission')
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }
    Cancel = () => {
        this.props.routerStore.push('/permission')
    }

    renderTreeNodes = (data: IPermissionStore.IPermissionTree[]) => data.map((item) => {
        if (item.children) {
            return (
                <TreeNode title={item.name} key={`${item.id}${item.name}`} value={item.id}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return <TreeNode title={item.name} key={`${item.id}${item.name}`} value={item.id} />
    })

    render() {
        const { permission, form, permissionTree } = this.props
        const { getFieldDecorator } = form
        const {
            name = '',
            // level = 0,
            pid = undefined,
            route = '',
            sort = 0
        } = permission || {}
        return (
            <div className='sb-form'>
                <Form className={styles.permissionModal} >
                    <FormItem {...formItemLayout} label="Permission Name">
                        {getFieldDecorator('name', {
                            initialValue: name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                        {/*  disabled={!this.typeIsAdd}  */}
                    </FormItem>

                    <FormItem {...formItemLayout} label="pid">
                        {permissionTree && permissionTree.length ? getFieldDecorator('pid', {
                            initialValue: pid,
                        })(< TreeSelect
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeDefaultExpandAll
                        >{this.renderTreeNodes(permissionTree)} </TreeSelect>) : 'loading tree'}
                    </FormItem>

                    {/* <FormItem {...formItemLayout} label="level">
                    {getFieldDecorator('level', {
                        initialValue: level,
                        rules: [
                            {
                                required: true, message: "Required"
                            }
                        ]
                    })(<InputNumber />)}
                </FormItem> */}

                    <FormItem {...formItemLayout} label="sort">
                        {getFieldDecorator('sort', {
                            initialValue: sort,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<InputNumber />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="route">
                        {getFieldDecorator('route', {
                            initialValue: route,
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                    <FormItem className={styles.btnBox}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </FormItem>
                </Form >

            </div>
        )
    }
}

export default Form.create<IProps>()(PermissionModal)
