import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, } from 'mobx'
import { Form, Input, Button, message, Modal, Checkbox, Tree, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { defaultOption, statusOption } from '../default.config'
import { camelCase } from '@utils/index'
const { TreeNode } = Tree
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        lg: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        lg: { span: 18 }
    }
}
// const statusOption = [
//     {
//         key: 'Disabled',
//         value: 0
//     },
//     {
//         key: 'Enable',
//         value: 1
//     }
// ]

interface IStoreProps {
    createCustom?: (custom: ICustomStore.ICustom) => Promise<any>
    modifyCustom?: (custom: ICustomStore.ICustom) => Promise<any>
    getCustoms?: () => Promise<any>
    getSidebar?: () => Promise<any>
}
interface IProps extends IStoreProps {
    visible: boolean
    onCancel: () => void
    custom?: ICustomStore.ICustom
}
@inject(
    (store: IStore): IStoreProps => {
        const { customStore, authStore } = store
        const { getSidebar } = authStore
        const { createCustom, modifyCustom, getCustoms } = customStore
        return { getSidebar, createCustom, modifyCustom, getCustoms }
    }
)

@observer
class CustomModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    private checkedKeys: string[] = []

    @computed
    get typeIsAdd() {
        return !this.props.custom || !this.props.custom.id
    }
    @computed
    get title() {
        return this.typeIsAdd ? 'Add Primary Template' : 'Edit Primary Template'
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }
    /**
     * @arr:所选择的选项的key
     * @target:要映射的目标
     */
    arrToObj = (arr: string[], target = {}) => {
        const tar = { ...target }
        arr.forEach(str => {
            const ObjName = str.split('.')
            let j = tar
            while (ObjName.length > 1) {
                j = tar[ObjName.shift()]
            }
            j[ObjName[0]] = j[ObjName[0]] || 1
        })
        return tar
    }


    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { custom, createCustom, modifyCustom, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                let gjb = JSON.parse(JSON.stringify(defaultOption))
                if (!err) {
                    this.toggleLoading()
                    const { primary_name, config, status } = values;
                    /**
                     * add_filed，search_filed是两个checkboxGroup 所以提交时时数组
                     * list_filed对应时个tree 所选项是checkedKeys 是一个 用.连接的obj 键的路径
                     * 所以用 arrToObj将对应的选择映射到对应的option的sub
                     */
                    const pre: ICustomStore.ICustom = {
                        primary_name,
                        config: {
                            add_filed: this.arrToObj(config.add_filed, gjb.add_filed),
                            search_filed: this.arrToObj(config.search_filed, gjb.search_filed),
                            list_filed: this.arrToObj(this.checkedKeys, gjb.list_filed),
                        },
                        status
                    }
                    try {
                        let data = { message: '' }
                        if (this.typeIsAdd) {
                            data = await createCustom(pre)
                        } else {
                            data = await modifyCustom({ ...pre, id: custom.id })
                        }
                        message.success(data.message)
                        this.props.getCustoms()
                        this.props.getSidebar()
                        this.onCancel()
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    getTrueKey = (obj: object) => {
        let arr: string[] = []
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'object') {
                const sub = this.getTrueKey(value)
                if (sub.length === Object.keys(value).length) {
                    arr.push(key)
                }
                arr = arr.concat(sub)
            } else if (!!value) {
                arr.push(key)
            }
        })
        return arr
    }
    getCheckBoxOption = (obj: object) => {
        return Object.entries(obj).map(([key]) => (
            {
                label: camelCase(key),
                value: key
            }
        ))
    }
    isEasyObj = (obj: object) => {
        return Object.entries(obj).every(([key, value]) => typeof value !== 'object')
    }
    renderTreeNodes = (data, pre) => Object.entries(data).map(([_key, value]) => {
        const key = pre ? `${pre}.${_key}` : `${_key}`
        if (typeof value === 'object') {
            return (
                <TreeNode title={camelCase(_key)} key={key}>
                    {this.renderTreeNodes(value, key)}
                </TreeNode>
            );
        }
        return <TreeNode title={camelCase(_key)} key={key} />
    })

    onCheck = (checkedKeys) => {
        this.checkedKeys = checkedKeys
    }
    onCancel = () => {
        this.props.onCancel()
        this.props.form.resetFields()
    }

    render() {
        const { custom, form, visible } = this.props
        const { getFieldDecorator } = form
        const {
            primary_name = '',
            status = undefined,
            config = JSON.parse(JSON.stringify(defaultOption))
        } = custom || {}
        return (
            <Modal
                title={this.title}
                visible={visible}
                onOk={this.submit}
                destroyOnClose={true}
                onCancel={this.onCancel}
                footer={
                    <Button type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
                }
            >
                <Form className={styles.customModal}>
                    <FormItem {...formItemLayout} label="Primary Name">
                        {getFieldDecorator('primary_name', {
                            initialValue: primary_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input disabled={!this.typeIsAdd} />)}
                    </FormItem>
                    {
                        Object.entries(config).map(([key, value]) => {
                            return <FormItem key={key} {...formItemLayout} label={camelCase(key)}>
                                {
                                    this.isEasyObj(value) ?
                                        getFieldDecorator(`config.${key}`, {
                                            initialValue: this.getTrueKey(value),
                                        })(<Checkbox.Group options={this.getCheckBoxOption(value)} />)
                                        : <Tree
                                            checkable
                                            defaultExpandAll
                                            defaultCheckedKeys={this.getTrueKey(value)}
                                            onCheck={this.onCheck}
                                        >{this.renderTreeNodes(value, '')}</Tree>
                                }
                            </FormItem>
                        })
                    }

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
                </Form>
            </Modal>
        )
    }
}

export default Form.create<IProps>()(CustomModal)
