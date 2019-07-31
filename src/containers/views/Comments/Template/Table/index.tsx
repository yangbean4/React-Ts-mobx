import * as React from 'react'
import { Table, message, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { statusOption } from '../web.config'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'


interface IStoreProps {
    getcommentsLoading?: boolean
    comments?: ICommentStore.IComment[]
    setComment?: (comment: ICommentStore.IComment) => void
    getCommentTplList?: () => Promise<any>
    setCommentType?: (string) => void
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
    setBreadcrumbArr?: (menus?: IGlobalStore.menu[]) => void
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, commentStore, globalStore } = store
        const { setBreadcrumbArr } = globalStore
        const {
            getcommentsLoading,
            setComment,
            getCommentTplList,
            comments,
            handleTableChange,
            page,
            pageSize,
            setCommentType,
            total
        } = commentStore
        return { routerStore, setBreadcrumbArr, getcommentsLoading, setComment, getCommentTplList, comments, handleTableChange, page, pageSize, setCommentType, total }
    }
)
@observer
class CommentTable extends ComponentExt<IProps> {

    @observable
    private commentType: string = ''

    @action
    modifyComment = (comment: ICommentStore.IComment) => {
        this.props.setComment(comment)
        this.resetBread(comment)
        this.props.routerStore.replace(`/comments/template/edit/${comment.id}`)
    }

    @action
    resetBread = (comment: ICommentStore.IComment) => {
        let arr = [
            {
                title: 'Comment Tempaltes',
                path: "/comments/template"
            }
        ] as IGlobalStore.menu[]
        arr.push({
            title: `Edit ${comment.com_name}`,
            path: `/comments/template/edit/${comment.id}`
        })

        this.props.setBreadcrumbArr(arr)
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
    componentWillUnmount() {
        this.props.setBreadcrumbArr()
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
                    <Table.Column<ICommentStore.IComment> key="id" title="ID" dataIndex="id" width={80} />
                    <Table.Column<ICommentStore.IComment> key="language" title="language" dataIndex="language" width={100} />
                    <Table.Column<ICommentStore.IComment>
                        key="head_portrait"
                        className={styles.Avatar}
                        title="Head Portrait"
                        dataIndex="head_portrait"
                        width={150}
                        render={(record) => <img src={record} alt="" width="40" height="40" />}
                    />
                    <Table.Column<ICommentStore.IComment> key="com_name" title="Comment Name" dataIndex="com_name" width={150} />
                    <Table.Column<ICommentStore.IComment> key="com_talk" title="Comment Talk" className={styles.longText} dataIndex="com_talk" width={330} />
                    <Table.Column<ICommentStore.IComment>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={80}
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
                                    this.$checkAuth('Offers-Comments-Comment Templates-Edit', [
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
