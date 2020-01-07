import { observable, action, runInAction } from 'mobx'
import { baseStore } from '../base'


export class LoadVideoStore extends baseStore<ILoadVideoStore.IitemForList> {

    /**
     * 获取列表的api接口
     */
    getListApi = this.api.loadVideo.getCollectList

    @observable
    creative: ILoadVideoStore.IItem

    @observable
    optionListDb: ILoadVideoStore.OptionListDb = {
        ios: [],
        android: []
    }

    @action
    getConfig = async () => {
        const res = await this.api.config.fullConfig();
        runInAction('SET', () => {
            this.optionListDb = res.data
        })
    }
}

export default new LoadVideoStore()
