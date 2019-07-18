import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Button, message, Modal, Upload } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import Icon from '@components/Icon'
import { _nameCase, ypeOf, testSize } from '@utils/index'
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
        lg: { span: 7 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 },
        lg: { span: 17 }
    }
}

interface IStoreProps {
    getRevenues?: () => Promise<any>
    RevenueList?: IRevenueStore.IRevenue[]
}
interface IProps extends IStoreProps {
    visible: boolean
    onCancel: () => void
    Exel?: IRevenueStore.IUpload
}
@inject(
    (store: IStore): IStoreProps => {
        const { revenueStore } = store

        const { getRevenues, RevenueList } = revenueStore
        return { getRevenues, RevenueList }
    }
)

@observer
class RevenueModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private ID: string = ''
    @observable
    private template: ITemplateStore.ITemplate = {}

    private removePropFile: boolean = false

    @observable
    private fileName: string

    @action
    toggleLoading = (type?) => {
        this.loading = type !== undefined ? type : !this.loading
    }

    @action
    setFileName = (name) => {
        this.fileName = name
    }


    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { Exel, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    console.log(values)
                    try {
                        this.toggleLoading(true)
                        values && await this.api.revenue.addRevenueList(values).then(res => {
                            if (res.errorcode == 0) {
                                message.success(res.message)
                                this.props.getRevenues()
                            }
                            this.onCancel()
                        })

                    } catch (err) {
                        console.log(err)
                    }
                    this.toggleLoading(false)
                }
            }
        )
    }
    @action
    onCancel = () => {
        this.props.onCancel()
        this.setFileName('')
        this.removePropFile = false
        this.toggleLoading(false)
        this.props.form.resetFields()
        this.ID = ''
    }
    @action
    removeFile = (key) => {
        this.setFileName('')
        this.props.form.resetFields()
        runInAction('clear_ID', () => {
            this.ID = ''
        })
    }

    render() {
        const { Exel, form, visible } = this.props
        const submitObj = { id: this.ID }
        const { getFieldDecorator } = form
        const typeID = '.xlsx, .csv';
        const props = {
            showUploadList: false,
            accept: typeID,
            name: 'file',
            onRemove: this.removeFile,
            beforeUpload: (file) => {
                const houz = file.name.split('.').pop()
                const isHtml = typeID.includes(houz)
                if (!isHtml) {
                    message.error('Upload failed! The file must be in xlsx or csv format.');
                }
                return isHtml
            },
            customRequest: (data) => {
                this.setFileName('')
                const formData = new FormData()
                formData.append('file', data.file)
                formData.append('type', 10)
                this.api.revenue.uploadExel(formData).then(res => {
                    this.setFileName(data.file.name)
                    this.props.form.setFieldsValue({
                        'id': res.data.id
                    })
                    runInAction('SET_ID', () => {
                        this.ID = res.data.id
                    })
                })
            }
        }
        return (
            <Modal
                title="Import"
                visible={visible}
                width={500}
                onOk={this.submit}
                destroyOnClose
                onCancel={this.onCancel}
                footer={
                    <Button type="primary" loading={this.loading} onClick={this.submit} >Submit</Button>
                }
            >
                <Form className={styles.templateModal}>
                    <FormItem {...formItemLayout} label="Revenue File">
                        {
                            getFieldDecorator('id', {
                                initialValue: submitObj.id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(

                                !this.fileName ? (<Upload {...props}>
                                    <Button type="primary" className={styles.uploadBtn} >
                                        <Icon type="iconshangchuan1" className={styles.uploadIcon} /> Upload File
                                    </Button>
                                </Upload>) : (<div className={styles.uploadArea}>
                                    <Icon type="iconwenjian" className={styles.floatBlock} />
                                    <span className={styles.floatBlock}>{this.fileName}</span>
                                    <Icon type="iconguanbi" className={styles.floatBlock} onClick={() => this.removeFile('id')} />
                                </div>)
                            )
                        }
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
export default Form.create<IProps>()(RevenueModal)
