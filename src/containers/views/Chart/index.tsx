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
      xName: 'Fill Rate(%)',
      yName: 'IPM(%)',
      title: '',
      data: detailData['1'],
      tooltip: (row: IChartStore.DataItem) => {
        const { pkg_name, platform, pid, date, strategy_id, app_key, creative_id, impression, strategy_name, bundle_id, fill_rate, ipm, lowest_ecpm } = row
        const pkg = platform === 'android' ? pkg_name : `${pkg_name}-${bundle_id}`
        return `Pkg Name : ${pkg}<br/> PID : ${lowest_ecpm}-${pid}<br/> Strategy : ${strategy_id}-${strategy_name}
         <p style="height: 1px; width:100%;border-bottom: 1px dashed #ccc;margin-top:8px;"></p>
          Impression : ${impression.toLocaleString("en-US")} <br/> Fill Rate : ${fill_rate}%  <br/> IPM : ${ipm}%
        `
      }
    } : {
        xName: 'CVR(%)',
        yName: 'CTR(%)',
        title: '',
        data: detailData['2'],
        tooltip: (row: IChartStore.DataItem) => {
          const { impression, ctr, cvr, creative_id, pid, app_id, app_key, platform, title, source_account_name, lowest_ecpm } = row
          const app = platform === 'android' ? `${app_key}-${app_id}` : `${app_key}-${app_id}-${title}`
          return `Account : ${source_account_name} <br/> App Id : ${app} <br/> Creative : ${creative_id}<br/> PID : ${lowest_ecpm}-${pid}<br/>
            <p style="height: 1px; width:100%;border-bottom: 1px dashed #ccc;"></p>
              Impression : ${impression.toLocaleString("en-US")} <br/> Fill Rate : ${ctr}%  <br/> IPM : ${cvr}%
          `
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
