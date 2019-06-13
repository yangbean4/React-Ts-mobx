import * as React from 'react'
import { Table, message, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'


interface IStoreProps {
    getcommentsLoading?: boolean
    comments?: ICommentStore.IComment[]
    setComment?: (comment: ICommentStore.IComment) => void
    getComments?: () => Promise<any>
    setCommentType?: (string) => void
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, commentStore } = store
        const {
            getcommentsLoading,
            setComment,
            getComments,
            comments,
            handleTableChange,
            page,
            pageSize,
            setCommentType,
            total
        } = commentStore
        return { routerStore, getcommentsLoading, setComment, getComments, comments, handleTableChange, page, pageSize, setCommentType, total }
    }
)
@observer
class CommentTable extends ComponentExt<IProps> {

    @observable
    private commentType: string = ''

    @observable
    private rowSelection: object = {

    }

    @action
    modifyComment = (comment: ICommentStore.IComment) => {
        this.props.setComment(comment)
        // this.props.routerStore.replace(`/companysite/edit/${comment.id}`)
    }
    // 去请求数据
    componentDidMount() {
        const companyType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        if (companyType !== this.commentType) {
            runInAction('SET_TYPE', () => {
                this.commentType = companyType
            })
        }
        this.props.setCommentType(companyType)
    }

    render() {
        const {
            scrollY,
            getcommentsLoading,
            comments,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<ICommentStore.IComment>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    rowSelection={this.rowSelection}
                    loading={getcommentsLoading}
                    dataSource={comments}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ICommentStore.IComment> key="id" title="ID" dataIndex="id" width={50} />
                    <Table.Column<ICommentStore.IComment> key="language" title="language" dataIndex="language" width={50} />
                    <Table.Column<ICommentStore.IComment>
                        key="head_portrait"
                        title="Head Portrait"
                        dataIndex="head_portrait"
                        width={100}
                        render={(record) => <img src={record} alt="" width="100" height="" />}
                    />
                    <Table.Column<ICommentStore.IComment> key="com_name" title="Comment Name" dataIndex="com_name" width={80} />
                    <Table.Column<ICommentStore.IComment> key="com_talk" title="Comment Talk" dataIndex="com_talk" width={200} />
                    <Table.Column<ICommentStore.IComment>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={100}
                        render={(_) => (
                            statusOption.find(item => item.value === _).key
                        )}
                    />
                    <Table.Column<ICommentStore.IComment>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Authorization-User Manage-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyComment(record)}>
                                            <Icon type="form" />
                                        </a>)
                                    ])
                                }
                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}

export default CommentTable
