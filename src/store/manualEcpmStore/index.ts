import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'

export class ManualStore extends StoreExt {
    @observable
    manualLoading: boolean = false

    @observable
    manualList: IManualEcpmStore.IList[] = []

    @observable
    AppIdCampaigns: IManualEcpmStore.IAppidCampaign = {}

    @observable
    country = [
        //     {
        //     id:0,
        //     code2:''
        // }
    ];

    @observable
    pidList = []

    @observable
    manualInfo: IManualEcpmStore.CommitParams = {}

    @observable
    pkgNamePidList = []

    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    pageSize: number = 10
    /**
     * users total
     *
     * @type {number}
     * @memberof UserStore
     */
    @observable
    total: number = 0

    @observable
    filter: IManualEcpmStore.SearchParams = {}

    @action
    changepage = (page: number) => {
        this.page = page
        this.getManualList()
    }



    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getManualList()
    }

    @action
    changeFilter = (data: IManualEcpmStore.SearchParams = {}) => {
        this.filter = { ...data }
        this.changepage(1)
    }




    @action
    reset = () => {
        this.page = 1
        this.pageSize = 10
        this.total = 0
        this.manualList = []
        runInAction('change_Filter', () => {
            this.filter = {

            }
        })
    }

    @action
    setPkgNamePid = async () => {
        try {
            const res = await this.api.manual.getPkgNamePid();
            runInAction('SET_PKG_PID', () => {
                this.pkgNamePidList = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    setAppIdCampaigns = async () => {
        try {
            const res = await this.api.manual.getAppIdCampaigns();
            runInAction('SET_APPID_CAMPAIGNS', () => {
                this.AppIdCampaigns = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    setCountrys = async () => {
        try {
            const res = await this.api.manual.getGeoList();
            runInAction('SET_COUNTRY', () => {
                this.country = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    setPidType = async () => {
        try {
            const res = await this.api.manual.getPidType();
            runInAction('SET_PID_TYPE', () => {
                this.pidList = res.data;
            })
        }
        catch (err) {
            console.log(err)
        }
    }



    @action
    getManualList = async () => {
        try {
            const res = await this.api.manual.getListDetail({ page: this.page, pageSize: this.pageSize, ...this.filter })
            runInAction('SET_USER_LIST', () => {
                this.manualList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.manualList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.manualLoading = false
        })
    }

    deleteManual = async (id) => {
        try {
            const res = await this.api.manual.deleteManualCpm({
                id
            })
            if (res.errorcode == 0) {
                this.$message.success(res.message);
                this.getManualList();
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    getManualInfo = async (id?: string | number) => {
        try {
            const res = await this.api.manual.getInfo({
                id
            })
            runInAction('SET_MANUAL_INFO', () => {
                this.manualInfo = res.data
            })
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    clearManualInfo = () => {
        this.manualInfo = {

        }
    }

    handleTableChange = (pagination: PaginationConfig) => {
        const { current, pageSize } = pagination
        if (current !== this.page) {
            this.changepage(current)
        }
        if (pageSize !== this.pageSize) {
            this.changePageSize(pageSize)
        }
    }
}

export default new ManualStore()
