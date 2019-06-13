import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import { Form, Input, Button, message, Select, Icon as AntIcon, Table } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
// 封装表单域组件
const FormItem = Form.Item

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        lg: { span: 6 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
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

interface IStoreProps {
    comment?: ICommentGroupStore.IGroup
    createComment?: (company: ICommentGroupStore.IGroup) => Promise<any>
    modifyComment?: (company: ICommentGroupStore.IGroup) => Promise<any>
    changepage?: (page: number) => void
    routerStore?: RouterStore
    clearComment?: () => void
}

interface IProps extends IStoreProps {
    type?: string
    onOk?: (id: string) => void
    onCancel?: () => void
}

@inject(
    (store: IStore): IProps => {
        const { commentGroupStore, routerStore } = store
        const { comment, createComment, modifyComment, clearComment } = commentGroupStore
        return { clearComment, comment, routerStore, createComment, modifyComment }
    }
)
@observer
class CommentModal extends ComponentExt<IProps & FormComponentProps> {
    @observable
    private loading: boolean = false

    @observable
    private template: [] = []

    @observable
    private head_portrait: string

    @computed
    get formItemLayout() {
        return this.props.type ? formItemLayoutForModel : formItemLayout
    }

    @computed
    get isAdd() {
        return !this.props.comment
    }

    @computed
    get buttonModalLayout() {
        return this.props.type ?  'btnBox' : ''
    }
    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    componentWillMount() {
        const { routerStore, comment = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        // if ((!isNaN(Id) && (!comment.id || comment.id !== Id)) && !this.props.type) {
        //     routerStore.push('/companysite')
        // }
    }
    componentWillUnmount() {
        this.props.clearComment()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, comment, createComment, modifyComment, form } = this.props
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
                            ...values,
                        }
                        if (this.isAdd) {
                            data = await createComment(values)
                        } else {
                            data = await modifyComment({ ...values, id: comment })
                        }
                        message.success(data.message)
                        if (this.props.type) {
                            this.props.onOk(data.data.id)
                            this.props.form.resetFields()
                        } else {
                            routerStore.push('/companysite')
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
        const { comment, form } = this.props
        const { getFieldDecorator } = form
        const {
            id = '',
            status = 1,
            group_name = '',
            group_language = '',
            group_template_ids = '',
        } = comment || {}
        return (
            <div className='sb-form'>
                <Form className={styles.CompanyModal} {...this.formItemLayout} style={{paddingLeft: 0}}>
                    {!this.isAdd && <FormItem label="ID"  >
                        {getFieldDecorator('id', {
                            initialValue: id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>
                    }
                    <FormItem label="Status"  >
                        {getFieldDecorator('status', {
                            initialValue: status,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input />)}
                    </FormItem>
                    <FormItem label="Group Name" >
                        {getFieldDecorator('group_name', {
                            initialValue: group_name,
                            rules: [{
                                required: true, message: "Required"
                            }
                            ]
                        })(<Input />)}
                    </FormItem>
                    <FormItem label="Group Language" >
                        {getFieldDecorator('group_language', {
                            initialValue: group_language,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                        })(<Input />)}
                    </FormItem>
                    <FormItem label="Comment Template" >
                        {getFieldDecorator('group_template_ids', {
                            initialValue: group_template_ids,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                        })(<Input />)}
                    </FormItem>
                    <FormItem className={styles.tableBox}>
                        <div>
                            <Table
                                className="center-table"
                                style={{ width: '100%' }}
                                bordered
                                rowKey="id"
                                showHeader={false}
                                dataSource={this.template}
                            >
                                <Table.Column<ICommentStore.IComment> key="id" title="ID" dataIndex="id" width={50} />
                                <Table.Column<ICommentStore.IComment> key="head_portrait" title="head_portrait" dataIndex="head_portrait" width={80} />
                                <Table.Column<ICommentStore.IComment> key="com_name" title="com_name" dataIndex="com_name" width={80} />
                                <Table.Column<ICommentStore.IComment> key="com_talk" title="com_talk" dataIndex="com_talk" width={200} />
                            </Table>
                        </div>
                    </FormItem>
                    <FormItem className={this.props.type? styles.modalBtn :styles.btnBox} >
                        <Button className={this.props.type? styles.btn : ''} type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>

            </div>
        )
    }
}

export default Form.create<IProps>()(CommentModal)
