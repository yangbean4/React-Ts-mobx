import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction, } from 'mobx'
import { Form, Input, Button, message, Modal, Checkbox, Tree, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { defaultOption, statusOption, disabled } from '../default.config'
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

const sortArr = ['add_filed', 'search_filed', 'list_filed']
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

    @observable
    private hasVersion: boolean

    @computed
    get useHasVersion() {
        return this.hasVersion !== undefined ? this.hasVersion : !this.props.custom ? false : this.props.custom.config.add_filed.version == 1
    }

    @observable
    private hasMd5: boolean

    get useHasMd5() {
        return this.hasMd5 !== undefined ? this.hasMd5 : !this.props.custom ? false : this.props.custom.config.add_filed.template_md5 == 1
    }

    @observable
    private checkedKeys: string[] = []
    // get checkedKeys() {
    //     const config = (this.props.custom||).config || JSON.parse(JSON.stringify(defaultOption))
    //     return this.checkedKeys.length ? this.checkedKeys : this.getListTrueKey(config.list_filed)
    // }
    // set checkedKeys(arr) {
    //     this.checkedKeys = arr
    // }

    @computed
    get defaultCheckTree() {
        const config = (this.props.custom || {}).config || JSON.parse(JSON.stringify(defaultOption))
        return this.getTrueKey(config.list_filed)
    }

    @computed
    get useCheckedKeys() {
        return this.checkedKeys.length ? this.checkedKeys : this.defaultCheckTree
    }

    @computed
    get typeIsAdd() {
        return !this.props.custom || !this.props.custom.id
    }
    @computed
    get title() {
        return this.typeIsAdd ? 'Add Primary Template' : 'Edit Primary Template'
    }

    @action
    setCheckedKeys = (arr) => {
        this.checkedKeys = arr
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
        const tar = JSON.parse(JSON.stringify({ ...target }).replace(/1/g, '0'))
        arr.forEach(str => {
            const ObjName = str.split('.')
            let j = tar
            while (ObjName.length > 1) {
                j = tar[ObjName.shift()]
            }
            j[ObjName[0]] = 1
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
                    const { primary_name, config, status } = values;
                    //console.log(config, this.useCheckedKeys)
                    this.toggleLoading()
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
                            list_filed: this.arrToObj(this.split(this.useCheckedKeys, 'operate'), gjb.list_filed),
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

    getTrueKey = (obj: object, pre?) => {
        let arr: string[] = []
        Object.entries(obj).forEach(([_key, value]) => {
            const key = pre ? `${pre}.${_key}` : _key

            if (typeof value === 'object') {
                const sub = this.getTrueKey(value, key)
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

    // getListTrueKey = (obj: object) => {
    //     const arr = this.getTrueKey(obj)
    //     if (JSON.stringify(arr) !== JSON.stringify(this.checkedKeys)) {
    //         this.setCheckedKeys(arr)
    //     }
    //     return arr
    // }

    getCheckBoxOption = (obj: object, group: string) => {
        return Object.entries(obj).map(([key, value]) => (
            {
                label: camelCase(key),
                value: key,
                disabled: !!disabled[group][key] || (((!this.useHasVersion && key === 'version') || (!this.useHasMd5 && key === 'template_md5')) && group !== 'add_filed')
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
        const dis = !!disabled.list_filed[key] || (!this.useHasVersion && _key === 'version') || (!this.useHasMd5 && _key === 'template_md5')
        return <TreeNode title={camelCase(_key)} key={key} disabled={dis} />
    })

    onCheck = (checkedKeys) => {
        this.setCheckedKeys(checkedKeys)
    }

    checkChange = (e, key) => {
        if (key === 'add_filed') {
            const hasVersion = e.includes('version')
            const hasMd5 = e.includes('template_md5')

            if (hasVersion !== this.useHasVersion) {
                runInAction('SET_V', () => {
                    this.hasVersion = hasVersion
                })
                if (!hasVersion) {
                    const { getFieldValue, setFieldsValue } = this.props.form
                    const { add_filed, search_filed } = getFieldValue('config')
                    setFieldsValue(
                        {
                            config: {
                                add_filed,
                                search_filed: this.split(search_filed, 'version'),
                            }
                        }
                    )
                    this.setCheckedKeys(this.split(this.useCheckedKeys, 'version'));
                }
            }
            if (hasMd5 !== this.useHasMd5) {
                runInAction('SET_V', () => {
                    this.hasMd5 = hasMd5
                })
                if (!hasMd5) {
                    const { getFieldValue, setFieldsValue } = this.props.form
                    const { add_filed, search_filed } = getFieldValue('config')
                    setFieldsValue(
                        {
                            config: {
                                add_filed,
                                search_filed: this.split(search_filed, 'template_md5'),
                            }
                        }
                    )
                    this.setCheckedKeys(this.split(this.useCheckedKeys, 'template_md5'));
                }
            }

        }
    }
    onCancel = () => {
        this.props.onCancel()
        this.props.form.resetFields()
    }

    split = (arr: string[], res: string): string[] => {
        const set = new Set(arr)
        set.delete(res)
        return [...set]
    }

    render() {
        const { custom, form, visible } = this.props
        const { getFieldDecorator } = form
        const {
            primary_name = '',
            status = 1,
            template_type = undefined,
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
                        })(<Input autoComplete="off" disabled={!this.typeIsAdd} />)}
                    </FormItem>
                    {
                        sortArr.map(key => {
                            const value = config[key]
                            const initialValue = this.getTrueKey(value)
                            // const checkedKeys = form.getFieldValue('config') ? form.getFieldValue('config.list_filed') : this.getListTrueKey(value)

                            return <FormItem key={key} {...formItemLayout} label={camelCase(key)}>
                                {

                                    getFieldDecorator(`config.${key}`, {
                                        initialValue,
                                        rules: [
                                            {
                                                required: true, message: "Required"
                                            }
                                        ]
                                    })(
                                        this.isEasyObj(value) ?
                                            <Checkbox.Group onChange={(e) => this.checkChange(e, key)} options={this.getCheckBoxOption(value, key)} />
                                            : <Tree
                                                checkable
                                                defaultExpandAll
                                                // defaultCheckedKeys={this.getListTrueKey(value)}
                                                onCheck={this.onCheck}
                                                checkedKeys={this.useCheckedKeys}
                                            >{this.renderTreeNodes(value, '')}</Tree>)
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
