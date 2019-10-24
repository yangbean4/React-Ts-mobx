import * as React from 'react'
import { Modal, Table, Popover } from 'antd'
import { observer, inject } from 'mobx-react'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import style from './index.scss'
import * as styles from '../index.scss'
interface IProps {
    visible: boolean
    onCancel: () => void
    tableData: any[]
    pkgname: string
}



@observer
class TableModal extends ComponentExt<IProps> {

    addWhiteBlack = () => {
        this.props.routerStore.push('/whiteBlackList/add')
    }

    render() {
        const { onCancel } = this.props;
        console.log(this.props.tableData)
        return (
            <Modal
                title="Placement-Campaign"
                visible={this.props.visible}
                onCancel={onCancel}
                footer={null}
                centered
                width={800}

            >
                <div>
                    {/* <div className={style.left}>
                        <p>Pkg Name</p>
                    </div> */}
                    <div className={style.right}>
                        <div className={style.wrap}>
                            <div className={style.left}>Pkg Name </div>
                            <div className={style.right}>{this.props.pkgname}</div>
                        </div>
                        
                        <Table<IWhiteBlackListStore.TableModalList>
                            className="center-table"
                            bordered
                            rowKey="placement_name_id"
                            locale={{ emptyText: 'No Data' }}
                            loading={false}
                            dataSource={this.props.tableData}
                            scroll={{ y: scrollY }}
                            pagination={false}
                        >
                            <Table.Column<IWhiteBlackListStore.TableModalList>
                                key="placement_name_id"
                                title="Placement"
                                dataIndex="placement_name_id"
                                width="33%"
                                render={(_, record) => record.placement_name_id ? record.placement_name_id : '--'}
                            />
                            <Table.Column<IWhiteBlackListStore.TableModalList>
                                key="type"
                                title="White/Black Type"
                                dataIndex="type"
                                width="33%"
                                render={(_, record) => record.type ? record.type : '--'
                                }
                            />
                            <Table.Column<IWhiteBlackListStore.TableModalList>
                                key="campaign_id_name"
                                title="Campaign"
                                dataIndex="campaign_id_name"
                                width="33%"
                                render={(_, record) => {
                                    if (!record.campaign_id_name) return '--';
                                    let appids = record.campaign_id_name.split(',')
                                    return appids.length > 1 ? (
                                        <Popover placement="left" content={(
                                            <div className={styles.popoverContent}>
                                                {appids.map((c) => (
                                                    <div>{c}</div>
                                                ))}
                                            </div>
                                        )}>
                                            {appids[0]},...
                                        </Popover>
                                    ) : appids[0]
                                }}
                            />

                        </Table>
                    </div>
                </div>

            </Modal>
        )
    }
}

export default TableModal
