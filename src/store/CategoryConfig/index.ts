/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-08-01 18:13:29
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-04 11:51:12
 */
import { observable, action, runInAction, observe } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'
import { message } from 'antd';
import { routerStore } from './../'
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
    categoryIdList: ICategoryConfigStore.categoryIdList[] = [

    ];
    /**
    * 加载Category时的loading
    *
    * @type {array}
    * @memberof CategoryConfig
    */


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

    @action
    getList = async () => {
        try {
            const res = await this.api.categoryConfig.getList();
            console.log(res.data)
            runInAction('getList', () => {
                this.categoryIdList = res.data;
            })
        } catch (err) {
            console.log(err)
        }
    }

    //获取详情
    @action
    getCategoryConfigDetail = async () => {
        this.getCategoryloading = true;
        try {
            const res = await this.api.categoryConfig.getDetail({ page: this.page, pageSize: this.pageSize, ...this.filters });
            runInAction('SET_CATAGORYLIST', () => {
                this.categoryList = res.data;
                this.total = res.total;
            })
            runInAction('HIDE_CATAGORYLIST', () => {
                this.getCategoryloading = false
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
                const code = datas[i].scene_code;
                isdelete_number.push('0');
                arrNumber.push(i);
                scene_code.push((code == 0 || code) ? code.toString() : '')
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

    addCategorySubmit = async (flag: number) => {
        console.log(this.addCategory);
        try {
            if (flag == 0) {
                const res = await this.api.categoryConfig.addCategory(this.addCategory);
                if (res.errorcode == 0) {
                    message.success(res.message);
                    routerStore.push('/category')
                }
            } else {
                const res = await this.api.categoryConfig.editCategory(this.addCategory);
                console.log(res);
                if (res.errorcode == 0) {
                    message.success(res.message)
                }
            }

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
        // this.addCategorySubmit();
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getCategoryConfigDetail()
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
export default new CategoryConfigStore();