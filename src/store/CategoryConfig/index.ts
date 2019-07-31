import { observable, action, runInAction, observe } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'
import { number } from 'prop-types';
import { getEnabledCategories } from 'trace_events';
import { async } from 'q';

export class CategoryConfigStore extends StoreExt {
    /**
     * 加载Category时的loading
     *
     * @type {boolean}
     * @memberof CategoryConfig
     */

    @observable
    getCategoryloading: boolean = false;


    @observable
    category_id?: number;


    /**
     * table page
     *
     * @type {number}
     * @memberof CategoryConfig
     */
    @observable
    page: number = 1

    /**
     * table pageSize
     *
     * @type {number}
     * @memberof CategoryConfig
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

    /**
    * 加载Category时的loading
    *
    * @type {array}
    * @memberof CategoryConfig
    */

    @observable
    categoryList: [] = [];



    @observable
    categoryIdList = [];
    /**
    * 加载Category时的loading
    *
    * @type {array}
    * @memberof CategoryConfig
    */

    @observable
    IList: any[] = [];

    @observable
    filters: ICategoryConfigStore.SearchParams = {}


    /**
     * 
     *
     * @type {}
     * @memberof addCategoryParams
     */

    @observable
    addCategory: ICategoryConfigStore.addCategoryParams = {}

    @observable
    showCategoryParams: ICategoryConfigStore.showCategoryParams = {
        number: [0],
        scene_code: [],
        scene_name: [],
        isdelete_number: [],
        screne_id: []
    }

    //获取详情
    @action
    getCategoryConfigDetail = async () => {
        this.getCategoryloading = true;
        try {
            const res = await this.api.categoryConfig.getDetail({ page: this.page, pageSize: this.pageSize, ...this.filters });
            runInAction('SET_CATAGORYLIST', () => {
                this.categoryList = res.data;
                for (let i in res.data) {
                    this.categoryIdList.push({
                        key: res.data[i].category_name,
                        value: res.data[i].category_id
                    })
                }
                console.log(this.categoryIdList);
                this.total = res.total;
            })
        } catch (err) {
            console.log(err)
        }

    }

    //获取单个category config 信息

    @action
    getCategoryInfo = async () => {
        try {
            const res = await this.api.categoryConfig.info({ category_id: this.category_id });
            console.log(res);
            let datas = res.data;
            let arrNumber = [];
            let scene_code = [];
            let scene_name = [];
            let isdelete_number = [];
            // let isdelete_number = [];
            let screne_id = [];
            for (let i = 0; i < datas.length; i++) {
                isdelete_number.push('0');
                arrNumber.push(i);
                scene_code.push(datas[i].scene_code.toString())
                scene_name.push(datas[i].scene_name);
                screne_id.push(datas[i].id);
            }
            console.log(arrNumber, scene_code, scene_name, screne_id);
            let a = {
                number: arrNumber,
                scene_code,
                scene_name,
                isdelete_number,
                screne_id
            }
            runInAction('GET_CATEGORY', () => {
                this.showCategoryParams = a;
                console.log(this.showCategoryParams)
            })

        } catch (err) {
            console.log(err);
        }
    }

    @action setCategoryId = async (val: number) => {
        this.category_id = val;
        return this.getCategoryInfo();
    }

    //addCategory  提交

    @action

    addCategorySubmit = async () => {
        try {
            const res = await this.api.categoryConfig.addCategory(this.addCategory);
            console.log(res);
        }
        catch (err) {
            console.log(err)
        }
    }

    @action
    changepage = async (nunber) => {
        this.page = nunber;
        this.getCategoryConfigDetail();
    }

    @action
    changeFilter = async (data) => {
        this.filters = data;
        this.changepage(1);
    }

    @action
    changeAddCategory = async (data) => {
        this.addCategory = data;
        this.addCategorySubmit();
    }

}
export default new CategoryConfigStore();