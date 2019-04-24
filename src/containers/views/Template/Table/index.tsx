import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, computed } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import TemplateModal from '../TemplateModal/index'
import { camelCase } from '@utils/index'
interface IStoreProps {
    getTemplatesloading?: boolean
    templatesList?: ITemplateStore.ITemplate[]
    getTemplates?: () => Promise<any>
    deleteTemplate?: (id: number) => Promise<any>
    handleTableChange?: (pagination: PaginationConfig) => void
    page?: number
    pageSize?: number
    total?: number
    templateConfig?: TemplateConfig

}

interface IProps extends IStoreProps {
    scrollY: number
}

@inject(
    (store: IStore): IStoreProps => {
        const {
            getTemplatesloading,
            deleteTemplate,
            handleTableChange,
            page,
            templatesList,
            pageSize,
            total,
            templateConfig
        } = store.templateStore
        return { templateConfig, templatesList, getTemplatesloading, deleteTemplate, handleTableChange, page, pageSize, total }
    }
)
@observer
class TemplateTable extends ComponentExt<IProps> {

    @observable
    private delModalVisible: boolean = false

    @observable
    private templateModalVisible: boolean = false

    @observable
    private delTemplate: ITemplateStore.ITemplate = {}

    @observable
    private currentTemplate: ITemplateStore.ITemplate = null

    @computed
    get list_filed() {
        return this.props.templateConfig.list_filed
    }
    get operate() {
        return this.props.templateConfig.list_filed.operate
    }
    @computed
    get tableList() {
        return Object.entries(this.list_filed).filter(([key, value]) => !!value).map(([key, value]) => key)
    }

    @action
    hideDelModalVisible = () => {
        this.delModalVisible = !this.delModalVisible
    }


    @action
    modifyTemplate = (template: ITemplateStore.ITemplate) => {
        this.currentTemplate = template
        this.templateModalVisible = true
    }
    @action
    hideTemplateModalVisible = () => {
        this.templateModalVisible = !this.templateModalVisible
    }

    @action
    deleteModel = (template: ITemplateStore.ITemplate) => {
        this.delTemplate = template
        this.hideDelModalVisible()
    }

    handelOk = async () => {
        const data = await this.props.deleteTemplate(this.delTemplate.id)
        message.success(data.message)
        this.hideDelModalVisible()
    }

    render() {
        const {
            scrollY,
            getTemplatesloading,
            templatesList,
            handleTableChange,
            page,
            pageSize,
            total
        } = this.props
        return (
            <React.Fragment>
                <Modal
                    title="Delete"
                    width={400}
                    visible={this.delModalVisible}
                    onCancel={this.hideDelModalVisible}
                    // onOk={() => deleteTemplate(this.delTemplate.id)}
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handelOk}>
                            Yes
                      </Button>,
                        <Button key="back" onClick={this.hideDelModalVisible}>No</Button>
                    ]}
                >

                    <p> Sure to delete {this.delTemplate.template_name}?</p>
                </Modal>

                <Table<ITemplateStore.ITemplate>
                    className="center-table"
                    style={{ width: '100%' }}
                    bordered
                    rowKey="id"
                    loading={getTemplatesloading}
                    dataSource={templatesList}
                    scroll={{ y: scrollY }}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        ...PageConfig
                    }}
                    onChange={handleTableChange}
                >
                    {
                        this.tableList.map((item) => {
                            return item !== 'operate' ? (
                                <Table.Column<ITemplateStore.ITemplate> key={item} title={camelCase(item)} dataIndex={item} width={160} />
                            ) : (
                                    this.operate.edit || this.operate.delete ? <Table.Column<ITemplateStore.ITemplate>
                                        key={item}
                                        title="Operate"
                                        width={120}
                                        render={(_, record) => (
                                            <span>

                                                {
                                                    this.operate.edit ? <a href="javascript:;" onClick={() => this.modifyTemplate(record)}>
                                                        <Icon type="form" />
                                                    </a> : null
                                                }

                                                {
                                                    this.operate.edit && this.operate.delete ? <Divider type="vertical" /> : null
                                                }
                                                {
                                                    this.operate.delete ? <a href="javascript:;" onClick={() => this.deleteModel(record)}>
                                                        <MyIcon type='iconshanchu' />
                                                    </a> : null
                                                }
                                            </span>
                                        )}
                                    /> : null
                                )
                        })
                    }

                </Table >
                <TemplateModal
                    visible={this.templateModalVisible}
                    onCancel={this.hideTemplateModalVisible}
                    template={this.currentTemplate}
                />
            </React.Fragment >
        )
    }
}

export default TemplateTable
