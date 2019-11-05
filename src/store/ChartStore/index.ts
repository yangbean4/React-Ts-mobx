/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-11-01 15:03:45
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-11-05 11:52:08
 */
import { observable, action, runInAction } from 'mobx'
import { StoreExt } from '@utils/reactExt'
import { typeOf } from '@utils/index'

type getFun = (da: IChartStore.DataItem) => string

const target = {
  '1': {
    x: 'fill_rate',
    y: 'ipm',
    count: 'impression',
    legend: 'strategy_name',
    label: (ele => `${ele.pid}-${ele.strategy_id}`) as getFun
  },
  '2': {
    x: 'cvr',
    y: 'ctr',
    count: 'impression',
    legend: 'app_id',
    label: (ele => `${ele.creative_id}-${ele.pid}`) as getFun
  },
}

const formatData = (data: IChartStore.DataItem[], type: IChartStore.modeltype): IChartStore.ChartItem[] => data.map(ele => {
  const tag = {}
  Object.entries(target[type]).forEach(([key, val]) => {
    tag[key] = typeOf(val) === 'string' ? ele[val as string] : typeOf(val) === 'function' ? (val as getFun)(ele) : ''
  })
  return ({
    ...(tag as IChartStore.ChartItem),
    data: ele
  })
})


export class ChartStore extends StoreExt {

  @observable
  loading: boolean = false

  @observable
  detailData: IChartStore.IDetailData = { '1': [], '2': [] }

  @observable
  modelType: IChartStore.modeltype = '1'

  @observable
  filters: IChartStore.SearchGroup = {}

  @observable
  optionListDb: IChartStore.OptionListDb = {
    placementEcpmList: [],
    strategyList: [],
    pkgNameList: [],
    appKeyList: [],
    creativeList: []
  }

  @action
  changeFilter = (data: IChartStore.SearchGroup) => {
    this.filters = { ...this.filters, ...data }
    return this.getData()
  }

  @action
  changeType = (type: IChartStore.modeltype) => {
    this.modelType = type
    this.getData()
  }

  @action
  getOptionListDb = async () => {
    const [strategyList, placementEcpmList, pkgNameRes, appKeyRes, creativeRes] = await Promise.all([
      this.api.chart.getStrategyList(),
      this.api.chart.getEcpm(),
      this.api.appGroup.getPkgnameData(),
      this.api.appsManage.senAppList({}),
      this.api.creativeFrequency.getCreatives()
    ]);
    runInAction('SET', () => {
      this.optionListDb = {
        placementEcpmList: placementEcpmList.data,
        strategyList: strategyList.data,
        pkgNameList: pkgNameRes.data,
        appKeyList: appKeyRes.data,
        creativeList: creativeRes.data
      }
    })
  }

  @action
  getData = async () => {
    this.loading = true
    try {
      runInAction('SET_COMMENT_LIST', () => {
        this.detailData[this.modelType] = []
      })
      const res = await this.api.chart.getData({ ...this.filters, type: this.modelType })
      const _data = formatData(res.data, this.modelType)
      runInAction('SET_COMMENT_LIST', () => {
        this.detailData[this.modelType] = _data
        this.loading = false
      })
    } catch (err) {
      console.log(err)
      runInAction('SET_COMMENT_LIST', () => {
        this.loading = false
      })
    }
  }
}

export default new ChartStore()
