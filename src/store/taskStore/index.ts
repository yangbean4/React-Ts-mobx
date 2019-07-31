import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'

import { StoreExt } from '@utils/reactExt'


export class TaskStore extends StoreExt {
    /**
     * 加载列表时的loading
     *
     * @type {boolean}
     * @memberof TaskStore
     */
    @observable
    getTaskLoading: boolean = false
    /**
     * 用户列表
     *
     * @type {ITaskStore.ITask[]}
     * @memberof TaskStore
     */
    @observable
    taskList: ITaskStore.ITaskForList[] = []

    @observable
    task: ITaskStore.ITask = {}

    @observable
    sceneImageConfig: any[] = null

    /**
     * table page
     *
     * @type {number}
     * @memberof TaskStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof TaskStore
     */
    @observable
    pageSize: number = 10
    /**
     * appGroupList total
     *
     * @type {number}
     * @memberof TaskStore
     */
    @observable
    total: number = 0

    @observable
    filters: ITaskStore.SearchParams = {}

    @observable
    optionListDb: ITaskStore.OptionListDb = {
        PkgnameData: [],
        Country: [],
        IgePkgname: []
    }

    @action
    getGeo = async () => {
        const res = await this.api.appGroup.getCountry()
        runInAction('SET', () => {
            this.optionListDb.Country = res.data;
        })
    }

    @action
    getPkgname = async () => {
        const res = await this.api.appGroup.getPkgnameData();
        runInAction('SET', () => {
            this.optionListDb.PkgnameData = res.data;
        })
    }

    @action
    getOptionListDb = async () => {
        const keys = Object.keys(this.optionListDb).filter(k => k !== 'PkgnameData')
        const promiseAll = keys.map(key => 'Country' === key
            ? this.api.appGroup[`get${key}`]()
            : this.api.task[`get${key}`]())
        Promise.all(promiseAll).then(data => {
            const target = {
                PkgnameData: this.optionListDb.PkgnameData
            }
            keys.forEach((key, index) => {
                target[key] = data[index].data
            })
            runInAction('SET', () => {
                this.optionListDb = target
            })
        })
    }

    @action
    setSceneViewConfig = (value: any[]) => {
        this.sceneImageConfig = value
    }

    /**
     * 加载任务列表
     *
     * @memberof TaskStore
     */

    @action
    getTaskList = async () => {
        this.getTaskLoading = true
        try {
            const res = await this.api.task.getTaskList({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_TASK_LIST', () => {
                this.taskList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_TASK_LIST', () => {
                this.taskList = []
                this.total = 0
            })
        }
        runInAction('HIDE_TASK_LIST_LOADING', () => {
            this.getTaskLoading = false
        })
    }

    /**
     * 设置task
     */
    @action
    setTaskAttr = (task: ITaskStore.ITaskForList, update: ITaskStore.ITaskForList) => {
        const index = this.taskList.findIndex(ele => ele.id === task.id);
        const arr = JSON.parse(JSON.stringify(this.taskList))
        Object.assign(arr[index], update)
        runInAction('SET', () => {
            this.taskList = arr;
        })
    }


    /**
     * 创建task
     */
    createTask = async (task: ITaskStore.ITask) => {
        return await this.api.task.createTask(task);
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getTaskList()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getTaskList()
    }

    @action
    changeFilter = (data: ITaskStore.SearchParams) => {
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

export default new TaskStore()
