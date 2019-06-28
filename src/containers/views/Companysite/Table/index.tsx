import * as React from 'react'
import { Table, message, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'


interface IStoreProps {
    getCompanyloading?: boolean
    companys?: ICompanyStore.ICompany[]
    setCompany?: (company: ICompanyStore.ICompany) => void
    getCompanys?: () => Promise<any>
    setCompanyType?: (string) => void
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
            setCompanyType,
            total
        } = companyStore
        return { routerStore, getCompanyloading, setCompany, getCompanys, companys, handleTableChange, page, pageSize, setCompanyType, total }
    }
)
@observer
class CompanyTable extends ComponentExt<IProps> {

    @observable
    private companyType: string = ''

    @action
    modifyCompany = (company: ICompanyStore.ICompany) => {
        this.props.setCompany(company)
        this.props.routerStore.replace(`/companysite/edit/${company.id}`)
    }
    // 去请求数据
    componentDidMount() {
        const companyType = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'
        if (companyType !== this.companyType) {
            runInAction('SET_TYPE', () => {
                this.companyType = companyType
            })
        }
        this.props.setCompanyType(companyType)
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
                <Table<ICompanyStore.ICompany>
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
                    <Table.Column<ICompanyStore.ICompany> key="company_name" title="Subsite Company" dataIndex="company_name" width={100} />
                    <Table.Column<ICompanyStore.ICompany> key="company_full_name" title="Full Name Of Subsite Company" dataIndex="company_full_name" width={200} />
                    <Table.Column<ICompanyStore.ICompany>
                        key="action"
                        title="Operate"
                        width={80}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Company-Subsite Company-Edit', [
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

export default CompanyTable
