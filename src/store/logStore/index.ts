import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'
import { dateFormat } from '@utils/index'

const datetime = [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()].map(ele => dateFormat(ele, 'yyyy-MM-dd')).join(' - ')
export class LogsStore extends StoreExt {
    @observable
    logsLoading: boolean = false

    @observable
    logType: string

    @observable
    logsList: ILogsStore.ILog[] = []

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
    filter: ILogsStore.SearchParams

    @action
    changepage = (page: number) => {
        this.page = page
        this.getLogs()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getLogs()
    }

    @action
    changeFilter = (data: ILogsStore.SearchParams = {}) => {
        this.filter = { ...data }
        this.changepage(1)
    }

    @action
    reset = () => {
        this.page = 1
        this.pageSize = 10
        this.total = 0
        this.logsList = []
        runInAction('change_Filter', () => {
            this.filter = {
                datetime,
            }
        })
    }

    @action
    setLogType = (type: string) => {
        this.logType = type
        this.reset()
        this.getLogs()
    }

    @action
    getLogs = async () => {
        try {
            const res = await this.api.log.getLogs({ page: this.page, pageSize: this.pageSize, ...this.filter, control: this.logType })
            runInAction('SET_USER_LIST', () => {
                this.logsList = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.logsList = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.logsLoading = false
        })
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

export default new LogsStore()
