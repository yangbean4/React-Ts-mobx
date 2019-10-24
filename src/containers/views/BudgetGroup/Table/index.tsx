import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { ComponentExt } from '@utils/reactExt';
import { Table, Icon, Modal, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import PageConfig from '@components/Pagination'
import * as stylesIndex from './../index.scss'
const { confirm } = Modal;
interface IStoreProps {
    getBudgetloading?: boolean
    page?: number
    pageSize?: number
    total?: number
    routerStore?: RouterStore
    budgetGroupList?: [IBudgetGroupStore.ITableList]
    handleTableChange?: (pagination: PaginationConfig) => void
    deleteData?: (id) => Promise<any>
}


interface IProps extends IStoreProps {
    scrollY?: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, budgetStore } = store;
        const {
            budgetGroupList,
            handleTableChange,
            page,
            pageSize,
            total,
            getBudgetloading,
            deleteData
        } = budgetStore;
        return {
            budgetGroupList,
            handleTableChange,
            page,
            pageSize,
            total,
            getBudgetloading,
            routerStore,
            deleteData
        }
    }
)

@observer
class BudgetTable extends ComponentExt<IProps>{

    goEdit = (record: IBudgetGroupStore.ITableList) => {
        this.props.routerStore.push(`/budget/edit/${record.id}`)
    }

    delete = (record) => {
        let id = record.id;
        let that = this;
        confirm({
            title: 'Confirm to delete it?',
            content: '',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk() {
                that.props.deleteData(id);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }
    render() {
        const {
            budgetGroupList,
            getBudgetloading,
            page,
            pageSize,
            handleTableChange,
            total,
            scrollY
        } = this.props;
        const content = function (str = '') {
            if (!str) return <div></div>;
            let arr = str.split(',') || [];
            const t = arr.map((item) => (
                <p>{item}</p>
            ))
            return <div>{t}</div>
        }

        const budget_handle = (_:string)=>{
            if(!_) return '';
            if(_.indexOf('.00') > -1){
                _ = _.slice(0,-3);
            }
            return <div>{_}</div>
        }

        return (
            <React.Fragment>
                <Table<IBudgetGroupStore.ITableList>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getBudgetloading}
                    dataSource={budgetGroupList}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    scroll={{ y: scrollY, x: 860 }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IBudgetGroupStore.ITableList> key="id" title="Group ID" dataIndex="id" width={110} />
                    <Table.Column<IBudgetGroupStore.ITableList> key="group_name" title="Group Name" dataIndex="group_name" width={200} />
                    <Table.Column<IBudgetGroupStore.ITableList> key="user_name" title="Source Account" dataIndex="user_name" width={200} />
                    <Table.Column<IBudgetGroupStore.ITableList> key="app_id" title="App ID" dataIndex="app_id" width={300} />
                    <Table.Column<IBudgetGroupStore.ITableList> key="sen_campaign" title="Campaign" dataIndex="sen_campaign" width={380}
                        render={(_) => (
                            <Popover placement="leftBottom" content={content(_)}>
                                <div className={stylesIndex.colClass}>{_}</div>
                            </Popover>
                        )}
                    />
                    <Table.Column<IBudgetGroupStore.ITableList> key="daily_budget" title="Daily Budget($)" dataIndex="daily_budget" width={200} 
                        render={(_) => (
                            <span>{budget_handle(_)}</span>
                        )}
                    />
                    <Table.Column<IBudgetGroupStore.ITableList> key="update_time" title="Update Time" dataIndex="update_time" width={200} />
                    <Table.Column<IBudgetGroupStore.ITableList> key="action" fixed='right' title="Operate" dataIndex="action" width={100}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Campaigns-Budget Group-Edit', [
                                        <a key='delete' href="javascript:;" onClick={() => { this.goEdit(record) }}>
                                            <Icon type="form" />
                                        </a>
                                    ])
                                }
                                &nbsp;&nbsp;
                                {
                                    this.$checkAuth('Offers-Campaigns-Budget Group-Delete', [
                                        <a key='form' href="javascript:;" onClick={() => { this.delete(record) }}>
                                            <Icon type="delete" />
                                        </a>
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

export default BudgetTable