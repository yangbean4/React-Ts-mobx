import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Input, Button, message, Select, Icon as AntIcon, Table, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'
import * as web from '../web.config'
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
const tableWidth = {
    labelCol: {
        lg: { span: 6 }
    },
    wrapperCol: {
        lg: { span: 15 }
    }
}
const formItemLayoutForModel = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 10 },
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
    getCommentTplList?: () => Promise<any>
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
    private language: string[] = [];

    @observable
    private selectedRowKeys: number[] = this.props.comment ? this.props.comment.group_template_ids.split(',').map(ele => Number(ele)) : []

    @observable
    private commentList: ICommentStore.IComment[] = []

    @computed
    get useCommentList(): ICommentStore.IComment[] {
        if (this.isAdd && this.commentList) {
            return this.commentList.filter(ele => ele.status === 1)
        } else if (this.commentList) {

            const ids = this.props.comment ? this.props.comment.group_template_ids : ''
            return this.commentList.filter(ele => ele.status === 1 || ids.includes(ele.id.toString())).sort((a, b) => {
                return Number(ids.includes(b.id.toString())) - Number(ids.includes(a.id.toString()))
            })
        }
    }
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
        return this.props.type ? 'btnBox' : ''
    }
    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    getComments = async (val = 'en') => {
        const res = await this.api.comment.selectTemplate({})
        const ret = res.data[val]
        runInAction('SET_COMMENT', () => {
            this.commentList = ret
        })
    }

    @action
    getLanaugeDetail = async () => {
        const res = await this.api.endcard.getlanguage()
        runInAction('SET_LANGAUE', () => {
            this.language = res.data
        })
    }

    @action
    rowSelection = () => {
        return {}
    }
    @action
    languageChange = (val) => {
        this.getComments(val)
    }

    @action
    setClassName = (record, index) => {
        return (record.status === 0 ? styles.disable : '')
    }

    componentWillMount() {

        this.getLanaugeDetail()
        const { routerStore, comment = {} } = this.props
        const routerId = routerStore.location.pathname.toString().split('/').pop()
        const Id = Number(routerId)
        if ((!isNaN(Id) && (!comment.id || comment.id !== Id)) && !this.props.type) {
            routerStore.push('/comments/groups')
        }
        if (Id) {
            this.getComments(this.props.comment.group_language)
        }
    }
    componentDidMount() {
        console.log(this.props.comment)
    }
    componentWillUnmount() {
        this.props.clearComment()
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, createComment, modifyComment, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    try {
                        let data = {
                            message: '',
                        }
                        values = {
                            ...values,
                        }
                        if (this.isAdd) {
                            data = await createComment(values)
                        } else {
                            data = await modifyComment({ ...values })
                        }
                        message.success(data.message)
                        if (this.props.type) {
                            this.props.form.resetFields()
                        } else {
                            routerStore.push('/comments/groups')
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    render() {
        const rowSelection = {
            selectedRowKeys: this.selectedRowKeys,
            onChange: (selectedRowKeys) => {
                runInAction('SET_SELECT', () => {
                    this.selectedRowKeys = selectedRowKeys
                })
                this.props.form.setFieldsValue({
                    group_template_ids: selectedRowKeys.join(',')
                })
            }
        }
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
                <Form className={styles.CompanyModal} {...this.formItemLayout} style={{ paddingLeft: 0 }}>
                    {!this.isAdd && <FormItem label="ID"  >
                        {getFieldDecorator('id', {
                            initialValue: id,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(<Input autoComplete="off" />)}
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
                    <FormItem label="Group Name" >
                        {getFieldDecorator('group_name', {
                            initialValue: group_name,
                            rules: [{
                                required: true, message: "Required"
                            }
                            ]
                        })(<Input autoComplete="off" />)}
                    </FormItem>
                    <FormItem label="Group Language" >
                        {getFieldDecorator('group_language', {
                            initialValue: group_language,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                        })(<Select
                            showSearch
                            onChange={this.languageChange}
                            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                            {
                                this.language && this.language.map((c, index) => (
                                    <Select.Option key={index} value={c}>
                                        {c}
                                    </Select.Option>
                                ))
                            }
                        </Select>)}
                    </FormItem>
                    <FormItem label="Comment Template ID" >
                        {getFieldDecorator('group_template_ids', {
                            initialValue: group_template_ids,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ],
                        })(<Input autoComplete="off" disabled={true} />)}
                    </FormItem>
                    <FormItem className={styles.tableBox} {...tableWidth}>
                        <div className={styles.tableContainer}>
                            <Table<ICommentStore.IComment>
                                className="center-table"
                                style={{ width: '100%' }}
                                bordered
                                rowKey="id"
                                rowSelection={rowSelection}
                                rowClassName={this.setClassName}
                                showHeader={false}
                                pagination={false}
                                dataSource={this.useCommentList}
                            >
                                <Table.Column<ICommentStore.IComment> key="id" title="ID" dataIndex="id" width={50} />
                                <Table.Column<ICommentStore.IComment>
                                    key="head_portrait"
                                    title="head_portrait"
                                    dataIndex="head_portrait"
                                    width={80}
                                    render={(record) => <img src={record} alt="" width="40" height="40" />} />
                                <Table.Column<ICommentStore.IComment> key="com_name" title="com_name" dataIndex="com_name" width={80} />
                                <Table.Column<ICommentStore.IComment> key="com_talk" title="com_talk" dataIndex="com_talk" width={200} />
                            </Table>
                        </div>
                    </FormItem>
                    <FormItem className={this.props.type ? styles.modalBtn : styles.btnBox} >
                        <Button className={this.props.type ? styles.btn : ''} type="primary" loading={this.loading} onClick={this.submit}>Submit</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create<IProps>()(CommentModal)
