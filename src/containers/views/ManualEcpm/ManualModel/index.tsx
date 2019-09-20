import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { observable, action, computed, runInAction } from 'mobx'
import { Form, Popover, Select, Button, message, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import * as styles from './index.scss'

const FormItem = Form.Item


const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        lg: { span: 3 }
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        lg: { span: 5 }
    }
}

interface IStoreProps {
    setAppIdCampaigns?: () => Promise<any>
    setCountrys?: () => Promise<any>
    AppIdCampaigns?: []
    country?: []
    pidList?: []
    setPidType?: () => Promise<any>
    routerStore?: RouterStore
    pkgNamePidList?: []
    setPkgNamePid?: () => Promise<any>
    manualInfo?: IManualEcpmStore.CommitParams
    getManualInfo?: (data) => Promise<any>
    clearManualInfo?: () => Promise<any>
}

interface IProps extends IStoreProps {
    onCancel?: () => void
    onOk?: (id: number) => void
    type?: string
    endcards?: string[]
    creatives?: string[]
}
@inject(
    (store: IStore): IProps => {
        const { manualEcpmStore, routerStore } = store
        const { clearManualInfo, manualInfo, getManualInfo, setPkgNamePid, pkgNamePidList, setPidType, pidList, AppIdCampaigns, country, setCountrys, setAppIdCampaigns } = manualEcpmStore
        return { clearManualInfo, manualInfo, getManualInfo, setPkgNamePid, pkgNamePidList, routerStore, setPidType, pidList, AppIdCampaigns, country, setCountrys, setAppIdCampaigns }
    }
)

@observer
class CampaignsModal extends ComponentExt<IProps & FormComponentProps> {

    @observable
    private loading: boolean = false

    @observable
    private isEdit: boolean = false

    @observable
    private appidDisable: boolean = false

    @observable
    private pkgNameDisable: boolean = false


    @observable
    private CommitParams: IManualEcpmStore.CommitParams = {}

    @observable
    private campaignsList: IManualEcpmStore.ICampaign[] = []

    @observable
    private pidList: IManualEcpmStore.IPid[] = []

    @computed
    get appidList() {
        return Object.keys(this.props.AppIdCampaigns)
    }

    @computed
    get pkgNameList() {
        return Object.keys(this.props.pkgNamePidList)
    }

    @action
    setCampaignsList = (appids: string[]) => {
        appids = appids || this.props.form.getFieldValue('app_id')
        const AppIdCampaigns = this.props.AppIdCampaigns
        if (appids.length === 0) {
            return this.campaignsList = [].concat.apply([], Object.values(AppIdCampaigns))
        }

        return this.campaignsList = [].concat.apply([], appids.map(v => AppIdCampaigns[v]))
    }

    @action
    setAppid = (campaignIds: string[]) => {
        if (campaignIds.length === 0) {
            this.props.form.setFieldsValue({
                app_id: []
            })
            this.setCampaignsList([])
            return this.appidDisable = false;
        }

        const appids = campaignIds.map(campaign_id => {
            const campaign = this.campaignsList.find(v => v.campaign_id === campaign_id)
            return campaign ? campaign.app_id : null
        })
        const currentAppids = this.props.form.getFieldValue('app_id');
        this.props.form.setFieldsValue({
            app_id: Array.from(new Set(appids.concat(currentAppids).filter(v => v)))
        })
        this.appidDisable = true
    }

    @action
    setPidList = (pkgnames: string[]) => {
        pkgnames = pkgnames || this.props.form.getFieldValue('pkg_name')
        const pkgNamePidList = this.props.pkgNamePidList
        if (pkgnames.length === 0) {
            return this.pidList = [].concat.apply([], Object.values(pkgNamePidList))
        }

        return this.pidList = [].concat.apply([], pkgnames.map(v => pkgNamePidList[v]))
    }

    @action
    setPkgName = (pids: string[]) => {
        if (pids.length === 0) {
            this.props.form.setFieldsValue({
                pkg_name: []
            })
            this.setPidList([])
            return this.pkgNameDisable = false;
        }

        const pkgnames = pids.map(pid => {
            const pkg = this.pidList.find(v => v.placement_id === pid)
            return pkg ? pkg.pkg_name : null
        })

        const currentPkgnames = this.props.form.getFieldValue('pkg_name');

        this.props.form.setFieldsValue({
            pkg_name: Array.from(new Set(pkgnames.concat(currentPkgnames).filter(v => v)))
        })
        this.pkgNameDisable = true
    }

    @action
    toggleLoading = () => {
        this.loading = !this.loading
    }

    @action
    getDetail = async () => {
        // const res = await this.api.campaigns.editBeforeCampaigns({ id: this.ID })
        runInAction('SET_APPManage', () => {
            // this.CommitParams = { ...res.data }
        })
    }

    @action
    AppIdChange = (value) => {
        // this._appIdKey = value
    }

    @action
    limitDecimals = (value: string | number): string => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string') {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number') {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    @action
    selectOption = (value) => {
        runInAction('SET_NEDDING', () => {
            // this.creative_id = value
        })
    }

    Cancel = () => {
        this.props.routerStore.push('/manual')
        // (this.props.type || !this.isAdd) && this.props.onCancel ? this.props.onCancel() : this.props.routerStore.push('/currency')
    }

    submit = (e?: React.FormEvent<any>): void => {
        if (e) {
            e.preventDefault()
        }
        const { routerStore, form } = this.props
        form.validateFields(
            async (err, values): Promise<any> => {
                if (!err) {
                    this.toggleLoading()
                    const id = this.props.match.params.id
                    try {
                        if (id === undefined) {
                            let data = await this.api.manual.manualEcpmAdd(values)
                            message.success(data.message)
                            routerStore.push('/manual')
                        } else {
                            let data = await this.api.manual.manualEcpmUpdate({
                                id: id,
                                cpm: values.cpm
                            })
                            message.success(data.message)
                            routerStore.push('/manual')
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    this.toggleLoading()
                }
            }
        )
    }

    @action
    init = async () => {
        // debugger;
        const id = this.props.routerStore.location.pathname.split('/').pop();


        if (!isNaN(Number(id))) {
            this.props.getManualInfo(+id);
            runInAction('CLEAR_MANUAL_INFO', () => {
                this.isEdit = true;
            })
        } else {
            this.props.clearManualInfo();
            runInAction('CLEAR_MANUAL_INFO', () => {
                this.isEdit = false;
            })
            this.props.setCountrys();

            await Promise.all([
                this.props.setAppIdCampaigns(),
                this.props.setPkgNamePid()
            ]);
            this.setCampaignsList([]);
            this.setPidList([]);
        }
    }

    componentWillUnmount() {
        this.props.clearManualInfo();
        this.props.form.resetFields();
    }

    componentWillMount() {
        // this.props.form.resetFields();
        // debugger;
        this.init();

    }

    render() {
        const reData = this.props.manualInfo;
        const { form, country, AppIdCampaigns, pkgNamePidList } = this.props
        const { getFieldDecorator } = form;
        return (
            <div className='sb-form'>
                <Form {...formItemLayout} className={styles.currencyModal} >
                    {
                        <FormItem label="App ID" >
                            {getFieldDecorator('app_id', {
                                initialValue: reData.app_id,
                                rules: [
                                    {
                                        required: false, message: "Required"
                                    }
                                ]
                            })(
                                <Select disabled={this.appidDisable || this.isEdit}
                                    showSearch
                                    mode="multiple"
                                    onChange={this.setCampaignsList}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.appidList.map(c => (
                                        <Select.Option key={c} value={c}>
                                            {c}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    }
                    <FormItem label="Campaign ID">
                        {getFieldDecorator('campaign_id',
                            {
                                initialValue: reData.campaign_id,
                                rules: [
                                    {
                                        required: true, message: "Required"
                                    }
                                ]
                            })(
                                <Select disabled={this.isEdit}
                                    showSearch
                                    mode="multiple"
                                    onChange={this.setAppid}
                                    getPopupContainer={trigger => trigger.parentElement}
                                    filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {this.campaignsList.map(c => (
                                        <Select.Option key={c.campaign_id} value={c.campaign_id}>
                                            {c.campaign_id_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="GEO">
                        {getFieldDecorator('country', {
                            initialValue: reData.country,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select disabled={this.isEdit}
                                showSearch
                                mode="multiple"
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {country.map(c => (
                                    <Select.Option key={c.id} value={c.code2}>
                                        {c.code2}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="Pkg Name">
                        {getFieldDecorator('pkg_name', {
                            initialValue: reData.pkg_name,
                        })(
                            <Select disabled={this.pkgNameDisable || this.isEdit}
                                showSearch
                                mode="multiple"
                                onChange={this.setPidList}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.pkgNameList.map(c => (
                                    <Select.Option key={c} value={c}>
                                        {c}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="PID"  >
                        {getFieldDecorator('pid', {
                            initialValue: reData.pid,
                            rules: [
                                {
                                    required: true, message: "Required"
                                }
                            ]
                        })(
                            <Select disabled={this.isEdit}
                                showSearch
                                mode="multiple"
                                onChange={this.setPkgName}
                                getPopupContainer={trigger => trigger.parentElement}
                                filterOption={(input, option) => option.props.children.props.content.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.pidList.map(c => (
                                    <Select.Option key={c.placement_id} value={c.placement_id}>
                                        <Popover content={c.placement_id_name} placement="right" overlayClassName={styles.popover}>
                                            <div className={styles.textHidden}>
                                                {c.placement_id_name}
                                            </div>
                                        </Popover>
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </FormItem>

                    <FormItem label="Manual eCPM">
                        <span style={{ marginRight: "5px" }}>$</span>
                        {getFieldDecorator('cpm', {
                            initialValue: reData.cpm,
                            validateTrigger: ['onBlur'],
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: (r, v, callback) => {
                                        if (v <= 0 && v != undefined) {
                                            callback('Manual eCPM should be positive!')
                                        }
                                        callback()
                                    }
                                }
                            ]
                        })(
                            <InputNumber max={99999999} formatter={this.limitDecimals} min={0} />
                        )}
                    </FormItem>

                    <FormItem className={this.props.type ? styles.vcMdoal : styles.btnBox} >
                        <Button type="primary" loading={this.loading} onClick={this.submit} style={{ marginRight: 10 }}>Submit</Button>
                        <Button onClick={this.Cancel}>Cancel</Button>
                    </FormItem>
                </Form>

            </div >
        )
    }
}

export default Form.create<IProps>()(CampaignsModal)
