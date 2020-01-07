/*
 * store 基类，提供列表查询，分页，loading；
 * 需要在子类中实现 getListApi 接口
 * @Author: kdylan
 * @Date: 2019-11-06 11:37:34
 * @Last Modified by: kdylan
 * @Last Modified time: 2019-11-06 15:06:52
 */
import { observable, action, runInAction } from 'mobx'
import { StoreExt } from '@utils/reactExt'
import { PaginationConfig } from 'antd/lib/pagination'


export abstract class baseStore<ItemForList = {}> extends StoreExt {

    /**
     * 获取列表的api接口
     */
    abstract getListApi(data?: any): Promise<any>

    /**
     * search filter字段
     */
    @observable
    filters = {}

    /**
     * 加载列表时的loading
     */
    @observable
    getListLoading: boolean = true

    /**
    * 数据列表
    */
    @observable
    list: ItemForList[] = []

    /**
     * table page
     */
    @observable
    page: number = 1

    /**
     * table pageSize
     */
    @observable
    pageSize: number = 10

    /**
     * list total
     */
    @observable
    total: number = 0

    /**
     * 加载数据列表
     */
    @action
    getList = async () => {
        this.getListLoading = true
        try {
            const res = await this.getListApi({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.list = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.list = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getListLoading = false
        })
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getList()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getList()
    }

    @action
    changeFilter = (data) => {
        this.filters = data
        this.changepage(1)
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
