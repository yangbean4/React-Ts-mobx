import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction, } from 'mobx'
import { Form, Input, Button, message, Modal, Select, Popover } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import { typeOf } from '@utils/index'

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


interface IStoreProps {
    createMask?: (mask: IMaskSubsiteStore.IMask) => Promise<any>
    modifyMask?: (mask: IMaskSubsiteStore.IMask) => Promise<any>
    getMasks?: () => Promise<any>
    optionListDb?: IMaskSubsiteStore.OptionListDb,
    getUsedMask?: () => void
}
interface IProps extends IStoreProps {
    visible: boolean
    onCancel: () => void
    mask?: IMaskSubsiteStore.IMask
}
@inject(
    (store: IStore): IStoreProps => {
        const { maskStore } = store
        const { createMask, modifyMask, getMasks, optionListDb, getUsedMask } = maskStore
        return { createMask, modifyMask, getMasks, optionListDb, getUsedMask }
    }
)

@observer
class MaskModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private selectAppidPlatform;

    @observable
    private usedMask = [];


    @computed
    get typeIsAdd() {
        return !this.props.mask || !this.props.mask.id
    }

    @computed
    get title() {
        return this.typeIsAdd ? 'Add Mask Subsite' : 'Edit Mask Subsite'
    }


    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    setSelectAppidPlatform = (value) => {
        let obj = (this.props.optionListDb.appIdData.find(v => v.alias_key === value) || {});
        this.selectAppidPlatform = obj.platform;
        this.usedMask = (this.props.optionListDb.usedMask[obj.alias_key] || '').split(',');
    }

    @computed
    get pkgNameList() {
        if (this.selectAppidPlatform == null) return this.props.optionListDb.pkgNameData;
        return this.props.optionListDb.pkgNameData.filter(v => v.platform === this.selectAppidPlatform);
    }



    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { mask, createMask, modifyMask, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()

                    try {
                        let data = { message: '' }
                        if (this.typeIsAdd) {
                            const app_id = this.props.optionListDb.appIdData.find(ele => ele.alias_key === values.app_key).app_id;
                            values = {
                                ...values,
                                app_key: `${values.app_key}`,
                                app_id,
                            }
                            data = await createMask(values);
                            this.props.getUsedMask();
                        } else {
                            data = await modifyMask({ mask_id: values.mask_id, subsite_ids: values.subsite_ids, id: mask.id })
                        }
                        message.success(data.message)
                        this.onCancel()
                    } catch (err) { }
                    this.toggleLoading()
                }
            }
        )
    }

    onCancel = () => {
        this.props.onCancel()
        this.props.form.resetFields()
    }

    render() {
        const { mask, form, visible, optionListDb } = this.props
        const { getFieldDecorator } = form
        const {
            app_id = '',
            app_key,
            subsite_ids,
            mask_id
        } = mask || {}



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

                <Form  {...formItemLayout} className={styles.maskModal}>
                    <FormItem label="App ID" >
                        {getFieldDecorator('app_key', {
                            initialValue: app_key,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select
                                allowClear={true}
                                showSearch
                                disabled={!this.typeIsAdd}
                                onChange={this.setSelectAppidPlatform}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => (option.props.children as Popover).props.content.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {optionListDb.appIdData.map(c => (
                                    <Select.Option key={c.alias_key} value={c.alias_key}>
                                        <Popover content={c.alias_key + '-' + c.app_id} placement="right" overlayClassName={styles.popovers}>
                                            <div className={styles.textHidden}>
                                                {c.alias_key + '-' + c.app_id}
                                            </div>
                                        </Popover>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem {...formItemLayout} label="Pkg Name">
                        {getFieldDecorator('subsite_ids',
                            {
                                initialValue: subsite_ids,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select
                                    showSearch
                                    mode='multiple'
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.pkgNameList.map(c => (
                                        <Select.Option key={c.id} value={c.dev_id} disabled={this.usedMask.includes(c.dev_id)}>
                                            {c.dev_id} - {c.pkg_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="Mask Subsite">
                        {getFieldDecorator('mask_id', {
                            initialValue: mask_id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>

                </Form>
            </Modal>
        )
    }
}

export default Form.create<IProps>()(MaskModal)
