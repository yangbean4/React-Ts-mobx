import * as React from 'react'
import { Table, Divider, Modal, Icon, Button, message } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import PageConfig from '@components/Pagination'
import { ComponentExt } from '@utils/reactExt'
import MyIcon from '@components/Icon'
import TemplateModal from '../TemplateModal/index'
import { camelCase } from '@utils/index'
import { async } from 'q';
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

    @observable
    private delUsed: boolean

    @observable
    private actionType: string

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
    modifyTemplate = async (template: ITemplateStore.ITemplate) => {
        const res = await this.api.template.templateDetailInUse({ id: template.id })

        if (res.data.errorcode !== 0) {
            this.setDelUsed(res.data.errorcode !== 0, 'edit')
            runInAction('sert', () => {
                this.delTemplate = template
            })
            setImmediate(() => {
                this.hideDelModalVisible()
            })
        } else {
            runInAction('www', () => {
                this.currentTemplate = template
                this.templateModalVisible = true
            })
        }

    }
    @action
    hideTemplateModalVisible = () => {
        this.templateModalVisible = !this.templateModalVisible
    }

    @action
    setDelUsed = (type, actionType) => {
        this.delUsed = type
        this.actionType = actionType
    }

    @action
    deleteModel = async (template: ITemplateStore.ITemplate) => {
        const res = await this.api.template.templateDetailInUse({ id: template.id })

        this.setDelUsed(res.data.errorcode !== 0, 'del')
        runInAction('sert', () => {
            this.delTemplate = template
        })
        setImmediate(() => {
            this.hideDelModalVisible()
        })
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
                    title={this.actionType === 'del' ? "Delete" : 'Edit'}
                    // destroyOnClose
                    width={400}
                    visible={this.delModalVisible}
                    onCancel={this.hideDelModalVisible}
                    // onOk={() => deleteTemplate(this.delTemplate.id)}
                    footer={
                        this.delUsed ? <Button key="back" onClick={this.hideDelModalVisible}>Yes</Button> : [
                            <Button key="submit" type="primary" onClick={this.handelOk}>
                                Yes
                      </Button>,
                            <Button key="back" onClick={this.hideDelModalVisible}>No</Button>
                        ]}
                >

                    {
                        this.actionType === 'del' ? (
                            this.delUsed ?
                                <p>It’s in use. Please remove the corresponding relation before deleting it!</p>
                                : <p> Sure to delete {this.delTemplate.template_name}?</p>
                        ) : (
                                <p>It’s in use. Please remove the corresponding relation before editit！</p>
                            )

                    }
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
