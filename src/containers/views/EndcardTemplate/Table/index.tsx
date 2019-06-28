import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message, Popover } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import { statusOption } from '../default.config'
import EndcardTemplateModal from '../TemplateModal'

interface IStoreProps {
    getEndcardTemplatesloading?: boolean
    endcardTemplates?: IEndcardTemplateStore.IEndcardTemplate[]
    getEndcardTemplates?: () => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    getSidebar?: () => Promise<any>

}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const { endcardTemplateStore, authStore } = store
        const {
            getEndcardTemplatesloading,
            endcardTemplates,
            getEndcardTemplates,
            handleTableChange,
            page,
            pageSize,
            total,
        } = endcardTemplateStore
        const { getSidebar } = authStore
        return { getSidebar, getEndcardTemplatesloading, endcardTemplates, getEndcardTemplates, handleTableChange, page, pageSize, total }
    }
)
@observer
class EndcardTemplateTable extends ComponentExt<IProps> {

    @observable
    private delModalVisible: boolean = false

    @observable
    private endcardTemplateModalVisible: boolean = false


    @observable
    private currentEndcardTemplate: IEndcardTemplateStore.IEndcardTemplate = null

    @action
    hideDelModalVisible = () => {
        this.delModalVisible = !this.delModalVisible
    }


    @action
    modifyEndcardTemplate = (endcardTemplate: IEndcardTemplateStore.IEndcardTemplate) => {
        this.currentEndcardTemplate = endcardTemplate
        this.endcardTemplateModalVisible = true
    }
    @action
    hideEndcardTemplateModalVisible = () => {
        this.endcardTemplateModalVisible = !this.endcardTemplateModalVisible
    }

    componentDidMount() {
        this.props.getEndcardTemplates()
    }


    render() {
        const {
            scrollY,
            getEndcardTemplatesloading,
            endcardTemplates,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Table<IEndcardTemplateStore.IEndcardTemplate>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getEndcardTemplatesloading}
                    dataSource={endcardTemplates}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate> key="template_id" title="Template ID" dataIndex="id" width={200} />

                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate> key="template_name" title="Template Name" dataIndex="template_name" width={200} />
                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate> key="md5" title="MD5" dataIndex="md5" width={200} />

                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate>
                        key="template_image"
                        title="Template Image"
                        dataIndex="template_image"
                        render={(_) => (
                            <span>
                                <Popover
                                    placement="top"
                                    trigger="click"
                                    content={(<img style={{ width: 100, height: 100 }} src={_} />)}
                                >
                                    <a href="javascript:;" key='btn-edit' >
                                        <Icon type="eye" />
                                    </a>
                                </Popover>
                            </span>
                        )}
                        width={200} />
                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate>
                        key="status"
                        title="Status"
                        dataIndex="status"
                        render={(_) => (
                            statusOption.find(item => item.value === _).key
                        )}
                        width={200}
                    />
                    <Table.Column<IEndcardTemplateStore.IEndcardTemplate>
                        key="action"
                        title="Operate"
                        width={200}
                        render={(_, record) => (
                            <span>
                                {
                                    this.$checkAuth('Offers-Endcards-Endcard Template-Edit', [
                                        <a href="javascript:;" onClick={() => this.modifyEndcardTemplate(record)}>
                                            <Icon type="form" />
                                        </a>
                                    ])
                                }

                            </span>
                        )}
                    />
                </Table >
                <EndcardTemplateModal
                    visible={this.endcardTemplateModalVisible}
                    onCancel={this.hideEndcardTemplateModalVisible}
                    endcardTemplate={this.currentEndcardTemplate}
                />
            </React.Fragment >
        )
    }
}

export default EndcardTemplateTable
