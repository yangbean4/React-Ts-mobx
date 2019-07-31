import * as React from 'react'
import { Table, Divider, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'

interface IStoreProps {
    getCurrencyLoading?: boolean
    currencyList?: ICurrencyStore.ICurrencyForList[]
    setCurrency?: (currency: ICurrencyStore.ICurrency) => void
    getCurrency?: () => Promise<any>
    deleteCurrency?: (id: number) => Promise<any>
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
        const { routerStore, currencyStore } = store
        const {
            getCurrencyLoading,
            currencyList,
            getCurrency,
            handleTableChange,
            page,
            pageSize,
            total,
            setCurrency
        } = currencyStore
        return { routerStore, setCurrency, getCurrencyLoading, currencyList, getCurrency, handleTableChange, page, pageSize, total }
    }
)
@observer
class CurrencyTable extends ComponentExt<IProps> {

    @observable
    private modalVisible: boolean = false


    @action
    hideCurrencyModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyCurrency = (currency: ICurrencyStore.ICurrencyForList, type?) => {
        this.props.setCurrency(currency)
        const {
            app_name,
            platform,
            pkg_name
        } = currency
        localStorage.setItem('TargetCurrency', JSON.stringify({
            platform,
            app_name,
            pkg_name,
        }))
        this.props.routerStore.push({
            pathname: '/currency/edit',
            state: {
                type
            }
        })
    }

    addCurrency = (record) => {
        this.props.routerStore.push('/currency/add')
    }

    componentDidMount() {
        this.props.getCurrency()
    }

    render() {
        const {
            scrollY,
            getCurrencyLoading,
            currencyList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <Table<ICurrencyStore.ICurrencyForList>
                className="center-table"
                style={{ width: '100%' }}
                bordered
                rowKey={r => (r.app_name + r.pkg_name).replace('.', '_') + r.platform}
                locale={{ emptyText: 'No Data' }}
                loading={getCurrencyLoading}
                dataSource={currencyList}
                scroll={{ y: scrollY }}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    ...PageConfig
                }}
                onChange={handleTableChange}
            >
                <Table.Column<ICurrencyStore.ICurrencyForList> key="app_name" title="App name" dataIndex="app_name" width={200} />
                <Table.Column<ICurrencyStore.ICurrencyForList> key="pkg_name" title="Pkg Name" dataIndex="pkg_name" width={200} />
                <Table.Column<ICurrencyStore.ICurrencyForList> key="Platform" title="Platform" dataIndex="platform" width={100} />
                <Table.Column<ICurrencyStore.ICurrencyForList>
                    key="action"
                    title="Operate"
                    width={120}
                    render={(_, record) => (
                        <span>
                            {
                                // this.$checkAuth('Apps-Virtual Currency-Add', [
                                (<a key='form' href="javascript:;" onClick={() => this.modifyCurrency(record)}>
                                    <Icon type="form" />
                                </a>)
                                // ])
                            }
                            {/* {
                                // this.$checkAuth('Apps-Virtual Currency-Edit&Apps-Virtual Currency-Add', (
                                <Divider key='Divider' type="vertical" />
                                // ))
                            }
                            {
                                // this.$checkAuth('Authorization-Currency Manage-Delete', (
                                <a href="javascript:;" onClick={() => this.modifyCurrency(record, 1)}>
                                    <Icon type='plus' />
                                </a>
                                // ))
                            } */}
                        </span>
                    )}
                />
            </Table>
        )
    }
}

export default CurrencyTable
