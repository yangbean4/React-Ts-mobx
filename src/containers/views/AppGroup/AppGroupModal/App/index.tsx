import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Select, Radio, Button, message, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import * as web from '../../web.config'
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
            status = 1,
            platform = 'android',
            not_in_appstore = 0,
            pkg_name = '',
            app_name = "",
            logo = '',
            spec = undefined,
            category = undefined,
            style = undefined,
            screen_type = 0,
            apply_screen_type = 0,
            account_id = undefined,
            preload_ige_num = undefined,
            preload_video_num,
            preload_playicon_num,
            recover_num,
            is_block = 0,
            recover_flag,
            contains_native_s2s_pid_types,
            sdk_token = '',
            s2s_token = '',
            subsite_id,
            ad_type = 0,
        } = appGroup || {}
        return (
            <div className='sb-form'>
                <Form className={styles.app} {...formItemLayout}>
                    <FormItem label="Status">
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.statusOption.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    {
                        this.isAdd && <FormItem label="Platform">
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
                                        {web.platformOption.map(c => (
                                            <Select.Option {...c}>
                                                {c.key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                )}
                        </FormItem>
                    }

                    <FormItem label="In the App Store">
                        {getFieldDecorator('not_in_appstore', {
                            initialValue: not_in_appstore,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.YesOrNo.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    {
                        this.isAdd && <FormItem label="Pkgname">
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

                    <FormItem label="App Name">
                        {getFieldDecorator('app_name', {
                            initialValue: app_name,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Icon">
                        {getFieldDecorator('logo', {
                            initialValue: logo,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>

                    <FormItem label="Spec">
                        {getFieldDecorator('spec',
                            {
                                initialValue: spec,
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
                                    {this.specOption.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="Category">
                        {getFieldDecorator('category',
                            {
                                initialValue: category,
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
                                    {this.categoryOption.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="Frame">
                        {getFieldDecorator('frame',
                            {
                                initialValue: frame,
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
                                    {this.frameOption.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="Style">
                        {getFieldDecorator('style',
                            {
                                initialValue: style,
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
                                    {this.StyleOption.map(c => (
                                        <Select.Option {...c}>
                                            {c.key}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="Screen Type">
                        {getFieldDecorator('screen_type', {
                            initialValue: screen_type,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.screenType.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="Apply Screen Type">
                        {getFieldDecorator('apply_screen_type', {
                            initialValue: apply_screen_type,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.screenType.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="SEN Account">
                        {getFieldDecorator('account_id', {
                            initialValue: account_id,
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
                                {this.accountOption.map(c => (
                                    <Select.Option {...c}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label='Preload Number'>

                    </FormItem>

                    <FormItem label="Blacklist">
                        {getFieldDecorator('is_block', {
                            initialValue: is_block,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Radio.Group>
                                {web.isBlock.map(c => (
                                    <Radio key={c.key} value={c.value}>
                                        {c.key}
                                    </Radio>
                                ))}
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="Recover Flag">
                        {getFieldDecorator('recover_flag', {
                            initialValue: recover_flag,
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
                                {web.recoverFlag.map(c => (
                                    <Select.Option {...c}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>




                    <FormItem label="AD Type">
                        {getFieldDecorator('ad_type', {
                            initialValue: ad_type,
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
                                {web.adType.map(c => (
                                    <Select.Option {...c}>
                                        {c.key}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <div className={styles.btnGroup}>
                        <Button type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                        <Button className={styles.btn2} onClick={() => this.Cancel()}>Cancel</Button>
                    </div>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(AppGroupModal)
