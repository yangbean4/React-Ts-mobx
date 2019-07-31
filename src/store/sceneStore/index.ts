import { observable, action, runInAction } from 'mobx'
import { PaginationConfig } from 'antd/lib/pagination'
import { StoreExt } from '@utils/reactExt'

export class SceneStore extends StoreExt {
    /**
     * 加载用户列表时的loading
     *
     * @type {boolean}
     * @memberof SceneStore
     */
    @observable
    getScenesloading: boolean = false
    /**
     * 用户列表
     *
     * @type {ISceneStore.IScene[]}
     * @memberof SceneStore
     */
    @observable
    scenes: ISceneStore.IScene[] = []

    @observable
    categoryList: ISceneStore.ICategory[] = []

    @observable
    IcategorIdList:ISceneStore.ICategoryLists[] = [];



    /**
     * table page
     *
     * @type {number}
     * @memberof SceneStore
     */
    @observable
    page: number = 1
    /**
     * table pageSize
     *
     * @type {number}
     * @memberof SceneStore
     */
    @observable
    pageSize: number = 10
    /**
     * scenes total
     *
     * @type {number}
     * @memberof SceneStore
     */
    @observable
    total: number = 0

    @observable
    filters: ISceneStore.SearchParams = {}

    /**
     * 加载用户列表
     *
     * @memberof SceneStore
     */

    @action
    getScenes = async () => {
        this.getScenesloading = true
        try {
            const res = await this.api.scene.getScenes({ page: this.page, pageSize: this.pageSize, ...this.filters })
            runInAction('SET_USER_LIST', () => {
                this.scenes = res.data
                this.total = res.total
            })
        } catch (err) {
            runInAction('SET_USER_LIST', () => {
                this.scenes = []
                this.total = 0
            })
        }
        runInAction('HIDE_USER_LIST_LOADING', () => {
            this.getScenesloading = false
        })
    }

    createScene = async (scene: ISceneStore.IScene) => {
        const res = await this.api.scene.createScene(scene)
        this.changepage(1)
        return res
    }

    @action
    modifyScene = async (scene: ISceneStore.IScene) => {
        const res = await this.api.scene.modifyScene(scene)
        this.changepage(1)
        return res
    }

    deleteScene = async (id: number) => {
        const res = await this.api.scene.deleteScene({ id })
        this.getScenes()
        return res
    }

    @action
    changepage = (page: number) => {
        this.page = page
        this.getScenes()
    }

    @action
    changePageSize = (pageSize: number) => {
        this.pageSize = pageSize
        this.getScenes()
    }

    @action
    changeFilter = (data: ISceneStore.SearchParams) => {
        this.filters = data
        this.changepage(1)
    }

    @action
    getCategoryIdLists = async () => {
        const res = await this.api.scene.getCategoryId();
        runInAction('set', () => {
            this.IcategorIdList = res.data;
        })
        return res.data
    }



    @action
    getCategory = async () => {
        // if (this.categoryList.length) {
        //     return this.categoryList
        // } else {
            const res = await this.api.scene.categoryAppId()
            runInAction('set', () => {
                this.categoryList = res.data
            })
            return res.data
        // }

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

export default new SceneStore()
