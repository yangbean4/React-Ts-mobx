import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { match } from 'react-router-dom'
// console.log(match)
interface IStoreProps {
    getCategoryloading?: boolean
    categoryList?: []
    getCategoryConfigDetail: () => Promise<any>
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore,
    match?: any
    handleTableChange?: (pagination: PaginationConfig) => void
}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, categoryConfigStore } = store
        const {
            getCategoryloading,
            categoryList,
            getCategoryConfigDetail,
            page, pageSize, total,
            handleTableChange
        } = categoryConfigStore;
        return {
            page, pageSize, handleTableChange, total, getCategoryloading, categoryList, getCategoryConfigDetail, routerStore,
        }
    }
)
@observer
class CategoryTable extends ComponentExt<IProps> {

    modifyUser(obj) {
        this.props.routerStore.push(`/category/edit/${obj.category_id}`)
    }

    componentDidMount() {
        // console.log(this.props.match)
        this.props.getCategoryConfigDetail()
    }


    render() {
        const {
            scrollY,
            categoryList,
            getCategoryloading,
            page,
            pageSize,
            total,
            handleTableChange
        } = this.props;
        return (
            <React.Fragment>
                <Table<ICategoryConfigStore.IList>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="category_id"
                    loading={getCategoryloading}
                    dataSource={categoryList}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}

                >
                    <Table.Column<ICategoryConfigStore.IList> key="category_name" title="Category" dataIndex="category_name" width={200} />
                    <Table.Column<ICategoryConfigStore.IList> key="scene" title="Scene" dataIndex="scene" />

                    <Table.Column<ICategoryConfigStore.IList>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Creative Analysis-Category Config-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyUser(record)}>
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

export default CategoryTable
