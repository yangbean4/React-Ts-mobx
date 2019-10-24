import { observable, action, runInAction, computed } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'
import { routerStore } from './../'
export class BudgetStore extends StoreExt {
    @observable
    filter: IBudgetGroupStore.SearchParams = {};

    @observable
    getBudgetloading: boolean = false;

    @observable
    page: number = 1

    @observable
    total: number = 0;

    @observable
    pageSize: number = 10;

    @observable
    budgetGroupList: [IBudgetGroupStore.ITableList] = [{}];

    @observable
    campaignOption: [IBudgetGroupStore.OptionList] = [{}]

    @observable
    OptionListDb: IBudgetGroupStore.OptionListDb = {
        accountData: [],
        appIdData: [],
        campaign: []
    }
    @observable
    campaignsData: IBudgetGroupStore.campaignsData = {
        accountData: {},
        appIdData: {}
    };

    @observable
    app_id_origin: any[] = []

    @observable
    initData: IBudgetGroupStore.AddBudgetParams = {}

    @action
    resetInitData = () => {
        this.initData = {}
    }


    @action
    getCampaignOption = async (data) => {
        //1为新增 0为编辑
        try {
            const res = await this.api.budgetGroup.getCampaignRelated( data );
            runInAction('SET_OPTION_DATA', () => {
                this.campaignOption = res.data;
                const tmp_data = Object.values(res.data);
                console.log(tmp_data);
                let arr = [];
                for (const key in tmp_data) {
                    if (tmp_data.hasOwnProperty(key)) {
                        const element = tmp_data[key];
                        arr = arr.concat(element);
                    }
                }
                let obj = {};
                let obj2 = {};
                let obj3 = {};
                let appkey_arr = [];
                let account_arr = [];
                let campaignId_arr = [];
                arr.map((item) => {
                    let name = item.user_name;
                    let temp = obj[name] || [];
                    let app_key = item.app_key;
                    let temp2 = obj2[app_key] || [];
                    let campaign_id = item.campaign_id;
                    let temp3 = obj3[campaign_id] || [];
                    if (!obj3[campaign_id]) {
                        obj3[campaign_id] = temp3;
                        obj3[campaign_id].push(item);
                        // item.campaign_id = item.campaign_id.toString();
                        campaignId_arr.push(item);
                    } else {
                        temp3.push(item);
                    }
                    if (!obj2[app_key]) {
                        obj2[app_key] = temp2;
                        obj2[app_key].push(item);
                        appkey_arr.push(item);
                    } else {
                        temp2.push(item);
                    }
                    if (!obj[name]) {
                        obj[name] = temp;
                        obj[name].push(item);
                        account_arr.push(item);
                    } else {
                        temp.push(item);
                    }
                })
                console.log(appkey_arr);
                runInAction('SET_OPTION_DB', () => {
                    this.campaignsData.accountData = obj;
                    this.campaignsData.appIdData = obj2;
                    this.OptionListDb.appIdData = appkey_arr;
                    this.OptionListDb.accountData = account_arr;
                    this.OptionListDb.campaign = campaignId_arr;
                    this.app_id_origin = appkey_arr;
                })
                console.log(campaignId_arr)
                // console.log(obj);
                // console.log(obj2);
                // console.log(obj3);
            })
        }
        catch (err) {
            console.log(err)
        }
    }


    @action
    commitData = async (data) => {
        try {
            console.log(data);
            const res = await this.api.budgetGroup.addBudgetGroup(data);
            console.log(res);
            if (res.errorcode == 0) {
                this.$message.success(res.message);
                routerStore.push('/budget')
            } else {
                this.$message.warn(res.message);
            }

        }
        catch (err) {
            console.log(err);
        }
    }


    editCommit = async (data) => {
        try {
            console.log(data);
            const res = await this.api.budgetGroup.editBudget(data);
            console.log(res);
            if (res.errorcode == 0) {
                this.$message.success(res.message);
                routerStore.push('/budget')
            } else {
                this.$message.warn(res.message);
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    @action
    deleteData = async (id) => {
        try {
            const res = await this.api.budgetGroup.delBudgetGroup({ id });
            console.log(res);
            this.$message.success(res.message);
            this.getListDetail();
        }
        catch (err) {
            console.log(err);
        }
    }

    @action
    editData = async (id) => {
        try {
            const res = await this.api.budgetGroup.editBudgetGroup({ id });
            console.log(res);
            runInAction('SET_DATA', () => {
                let data = res.data;
                let arr = [];
                res.data.campaign.map((item) => {
                    console.log(item.sen_campaign_id);
                    arr.push(item.sen_campaign_id + '')
                })
                data.campaign = arr;
                console.log(data, arr.toString())
                this.initData = data;
            })
        }
        catch (err) {
            console.log(err);
        }
    }

    @computed
    get getSourceAccount() {
        return [].concat.call([], Object.values(this.getCampaignOption));
    }
    @action
    getListDetail = async () => {
        this.getBudgetloading = true;
        try {
            const res = await this.api.budgetGroup.getDetail({ page: this.page, pageSize: this.pageSize, ...this.filter });
            runInAction('SET_BUDGET', () => {
                this.budgetGroupList = res.data;
                this.total = res.total;
            })
            runInAction('HIDE_BUDGETLIST', () => {
                this.getBudgetloading = false
            })
        }
        catch (err) {
            console.log(err)
        }
    }



    @action
    changeFilter = async (data) => {
        this.filter = data;
        this.changepage(1)
    }
    @action
    changepage = async (number: number) => {
        this.page = number;
        this.getListDetail();
    }

    @action
    changepageSize = (pageSize: number) => {
        this.pageSize = pageSize;
        this.getListDetail();
    }

    handleTableChange = (pagination: PaginationConfig) => {
        const { current, pageSize } = pagination;
        if (current !== this.page) {
            this.changepage(current);
        }
        if (pageSize !== this.pageSize) {
            this.changepageSize(pageSize)
        }
    }


}

export default new BudgetStore()