import * as React from 'react'
import { Table, message, Icon, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { statusOption } from '../web.config'
import { FormatNumber } from '@utils/transRender'
import { ComponentExt } from '@utils/reactExt'


interface IStoreProps {
    getcommentsLoading?: boolean
    comments?: ICommentGroupStore.IGroup[]
    setComment?: (comment: ICommentGroupStore.IGroup) => void
    getCommentGroups?: () => Promise<any>
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
        const { routerStore, commentGroupStore } = store
        const {
            getcommentsLoading,
            setComment,
            getCommentGroups,
            comments,
            handleTableChange,
            page,
            pageSize,
            setCommentType,
            total
        } = commentGroupStore
        return { routerStore, getcommentsLoading, setComment, getCommentGroups, comments, handleTableChange, page, pageSize, setCommentType, total }
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
        this.props.routerStore.replace(`/comments/groups/edit/${comment.id}`)
    }
    @action
    hoverToast = () => {

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
        const style = {
            marginLeft: '10px'
        }
        const styles = {
            maxWidth: '130px',
            height: 'auto',
            wordWrap: 'break-world',
            wordBreak: 'break-all'
        }
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
                <Table<ICommentGroupStore.IGroup>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
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
                    <Table.Column<ICommentGroupStore.IGroup> key="id" title="ID" dataIndex="id" width={50} />
                    <Table.Column<ICommentGroupStore.IGroup> key="group_name" title="Group Name" dataIndex="group_name" width={100} />
                    <Table.Column<ICommentGroupStore.IGroup>
                        key="group_language"
                        title="Group Language"
                        dataIndex="group_language"
                        width={100}
                    />
                    <Table.Column<ICommentGroupStore.IGroup>
                        key="comments"
                        title="Comment Template ID"
                        dataIndex="comments"
                        width={200}
                        render={(_, record) => (
                            <span>
                                {
                                    record.comments && record.comments.map((c, index) => (
                                        <Popover
                                            placement="top"
                                            trigger="hover"
                                            key={index}
                                            content={<p style={styles}>{c.comment}</p>}
                                        >
                                            <a href="javascript:;" style={style} key={index}>{FormatNumber(c.id)}</a>
                                        </Popover>
                                    ))
                                }
                            </span>
                        )}
                    />
                    <Table.Column<ICommentGroupStore.IGroup>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={100}
                        render={(_) => (
                            statusOption.find(item => item.value === _).key
                        )}
                    />
                    <Table.Column<ICommentGroupStore.IGroup>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Comments-Comment Groups-Edit', [
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
