import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { Tabs, Radio } from 'antd'
const { TabPane } = Tabs;
import * as styles from './index.scss'

import Search from './Search'
import Chart from './Chart'

interface IStoreProps {
  detailData?: IChartStore.IDetailData
  modelType?: IChartStore.modeltype
  changeType?: (type: IChartStore.modeltype) => void

}

@inject(
  (store: IStore): IStoreProps => {
    const { chartStore } = store
    const { detailData, modelType, changeType } = chartStore
    return { detailData, modelType, changeType }
  }
)

@observer
class ChartPage extends React.Component<IStoreProps>{

  componentDidMount() {
    this.props.changeType(this.props.modelType)
  }
  handleModeChange = (e) => {
    const mode = e.target.value
    this.props.changeType(mode)
  }

  render() {
    const { detailData, modelType } = this.props
    const chartProps = modelType === '1' ? {
      xName: 'Fill Rate',
      yName: 'IPM',
      title: '',
      data: detailData['1'],
      tooltip: (row) => {
        const data = row.data as IChartStore.DataItem
        const { pkg_name, platform, pid, date, strategy, app_key, creative_id, impression } = data

        return `Pkg Name : ${platform}
        `
      }
    } : {
        xName: 'CVR',
        yName: 'CTR',
        title: '',
        data: detailData['2'],
        tooltip: (data) => {
          return ''
        }
      }
    return (
      <div className={styles.page} >
        <Radio.Group onChange={this.handleModeChange} value={modelType} size='large' className={styles.RadioBox}>
          <Radio.Button value="1">Subsite</Radio.Button>
          <Radio.Button value="2">Source</Radio.Button>
        </Radio.Group>
        <div className={styles.box}>
          <div className={styles.Search}>
            <Search />
          </div>
          <div className={styles.Chart}>
            <Chart
              {...chartProps}
            />
          </div>
        </div>
      </div>
      // <Tabs defaultActiveKey={modelType} onChange={changeType}>
      //   <TabPane tab="下游" key="1">
      //     <div className={styles.box}>
      //       <div className={styles.Search}>
      //         <Search />
      //       </div>
      //       <div className={styles.Chart}>
      //         <Chart
      //           xName='Fill Rate'
      //           yName='IPM'
      //           title=''
      //           data={detailData['1']}
      //           tooltip={(data) => {
      //             return ''
      //           }}
      //         />
      //       </div>
      //     </div>
      //   </TabPane>
      //   <TabPane tab="上游" key="2">
      //     <div className={styles.box}>
      //       <div className={styles.Search}>
      //         <Search />
      //       </div>
      //       <div className={styles.Chart}>
      //         <Chart
      //           xName='CVR'
      //           yName='CTR'
      //           title=''
      //           data={detailData['2']}
      //           tooltip={(data) => {
      //             return ''
      //           }}
      //         />
      //       </div>
      //     </div>
      //   </TabPane>
      // </Tabs>
      // <Search />
    )
  }
}

export default ChartPage
