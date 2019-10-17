import * as React from 'react'
import { Table, Icon } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, autorun, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption, accountTypeOption } from '../web.config'
import { camelCase } from '@utils/index'

interface IStoreProps {
    getAccountLoading?: boolean
    accounts?: IAccountStore.IAccount[]
    setAccount?: (account: IAccountStore.IAccount) => void
    getAccounts?: () => Promise<any>
    // deleteAccount?: (id: number) => Promise<any>
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
        const { routerStore, accountStore } = store
        const {
            getAccountLoading,
            accounts,
            getAccounts,
            handleTableChange,
            page,
            pageSize,
            total,
            setAccount,

        } = accountStore
        return { routerStore, setAccount, getAccountLoading, accounts, getAccounts, handleTableChange, page, pageSize, total }
    }
)
@observer
class AccountTable extends ComponentExt<IProps> {


    @observable
    private modalVisible: boolean = false

    private accountType: string = this.props.routerStore.location.pathname.includes('source') ? 'source' : 'subsite'

    @computed
    get typeName() {
        return `${camelCase(this.accountType)} Company`
    }

    @action
    hideAccountModalVisible = () => {
        this.modalVisible = !this.modalVisible
    }

    @action
    modifyAccount = (account: IAccountStore.IAccount) => {
        this.props.setAccount(account)
        this.props.routerStore.replace(`/account/${this.accountType}/edit/${account.id}`)
    }

    render() {
        const {
            scrollY,
            getAccountLoading,
            accounts,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<IAccountStore.IAccount>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getAccountLoading}
                    dataSource={accounts}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IAccountStore.IAccount> key="user_name" title="User Name" dataIndex="user_name" width={200} />
                    <Table.Column<IAccountStore.IAccount> key="company_name" title={this.typeName} dataIndex="company_name" width={200} />
                    <Table.Column<IAccountStore.IAccount>
                        key="role_name"
                        title="Role"
                        dataIndex="role_name"
                        width={100}
                    />
                    {
                        this.accountType === 'source' && <Table.Column<IAccountStore.IAccount>
                            key="account_type"
                            title="Account Type"
                            dataIndex="account_type"
                            width={200}
                        // render={(_) => (
                        //     (accountTypeOption.find(item => item.value === _) || { key: '' }).key
                        // )}
                        />
                    }
                    <Table.Column<IAccountStore.IAccount>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        width={100}
                        render={(_) => (
                            statusOption.find(item => item.value === _).key
                        )}
                    />
                    <Table.Column<IAccountStore.IAccount>
                        key="action"
                        title="Operate"
                        width={120}
                        render={(_, record) => (
                            <span>
                                {
                                    // this.$checkAuth('Authorization-Account Manage-Edit', [
                                    (<a key='form' href="javascript:;" onClick={() => this.modifyAccount(record)}>
                                        <Icon type="form" />
                                    </a>)
                                    // ])
                                }
                            </span>
                        )}
                    />
                </Table>
            </React.Fragment>
        )
    }
}

export default AccountTable
