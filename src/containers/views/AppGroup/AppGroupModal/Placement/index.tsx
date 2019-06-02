import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { statusOption, platformOption } from '../../web.config'
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

interface IStoreProps {
    createAppGroup?: (appGroup: IAppGroupStore.IAppGroup) => Promise<any>
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    appGroup?: IAppGroupStore.IAppGroup
    onCancel?: () => void
}
@inject(
    (store: IStore): IProps => {
        const { appGroupStore, routerStore } = store
        const { createAppGroup } = appGroupStore
        return { routerStore, createAppGroup }
    }
)
@observer
class AppGroupModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @computed
    get isAdd() {
        return !this.props.appGroup
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    Cancel = () => {
        this.isAdd ? this.props.routerStore.push('/apps') : this.props.onCancel()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createAppGroup, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = await createAppGroup(values)
                        message.success(data.message)
                        const {
                            pkg_name,
                            platform
                        } = values
                        localStorage.setItem('TargetAppGroup', JSON.stringify({
                            pkg_name,
                            platform
                        }))
                        routerStore.push('/apps/edit')
                    } catch (err) {
                        //console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const { appGroup, form } = this.props
        const { getFieldDecorator } = form
        let roleValue: (string | number)[] = []
        const {
            platform = 'Android',
            vc_name = '',
            pkg_name = "",
            vc_exchange_rate = '',
            vc_callback_url = '',
            vc_desc = '',
            vc_secret_key = '',
            status = 1,
        } = appGroup || {}
        return (
            <div className='sb-form'>
                <Form className={styles.appGroupModal} >
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
                    {
                        this.isAdd && <FormItem {...formItemLayout} label="Pkgname">
                            {getFieldDecorator('pkg_name', {
                                initialValue: pkg_name,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(<Input />)}
                        </FormItem>
                    }
                    {
                        this.isAdd && <FormItem {...formItemLayout} label="Platform">
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
                                        showSearch
                                        filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                    }

                    <FormItem {...formItemLayout} label="VC Name">
                        {getFieldDecorator('vc_name', {
                            initialValue: vc_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="VC Description" {...formItemLayout} >
                        {getFieldDecorator('vc_desc', {
                            initialValue: vc_desc,
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>

                    <FormItem {...formItemLayout} label="VC Exchange Rate">
                        {getFieldDecorator('vc_exchange_rate', {
                            initialValue: vc_exchange_rate,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<InputNumber precision={0} />)}
                        <span>=1$</span>
                    </FormItem>

                    <FormItem label="VC Callback Url" {...formItemLayout} >
                        {getFieldDecorator('vc_callback_url', {
                            initialValue: vc_callback_url,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="VC Secret Key">
                        {getFieldDecorator('vc_secret_key', {
                            initialValue: vc_secret_key,
                        })(<Input />)}
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

export default Form.create<IProps>()(AppGroupModal)
