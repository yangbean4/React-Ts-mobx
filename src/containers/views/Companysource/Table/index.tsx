import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
interface IStoreProps {
    getCompanyloading?: boolean
    companys?: ICompanyStore.ICompany[]
    setCompany?: (user: IUserStore.IUser) => void
    getCompanys?: () => Promise<any>
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
        const { routerStore, companyStore } = store
        const {
            getCompanyloading,
            setCompany,
            getCompanys,
            companys,
            handleTableChange,
            page,
            pageSize,
            total
        } = companyStore
        return { routerStore, getCompanyloading, setCompany, getCompanys, companys, handleTableChange, page, pageSize, total }
    }
)
@observer
class AdsourceTable extends ComponentExt<IProps> {
    @action
    modifyCompany = (user: IUserStore.IUser) => {
        this.props.setCompany(user)
        this.props.routerStore.replace(`/companysource/edit/${user.id}`)
    }

    componentDidMount() {
        this.props.getCompanys()
    }
    render() {
        const {
            scrollY,
            getCompanyloading,
            companys,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<IUserStore.IUser>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getCompanyloading}
                    dataSource={companys}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<ICompanyStore.ICompany> key="company_name" title="Source Company" dataIndex="company_name" width={100} />
                    <Table.Column<ICompanyStore.ICompany> key="company_full_name" title="Full Name Of Source Company" dataIndex="company_full_name" width={200} />
                    <Table.Column<ICompanyStore.ICompany>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Authorization-User Manage-Edit', [
                                        (<a key='form' href="javascript:;" onClick={() => this.modifyCompany(record)}>
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

export default AdsourceTable
