import * as React from 'react'

import echarts from 'echarts'
import './myTheme'
let myChart;

interface IDataProps {
  xName: string
  yName: string
  data: any[]
  title: string
  tooltip: (data: any) => string
}

class Chart extends React.Component<IDataProps> {

  componentDidUpdate() {
    this.drawChart(this.props)
  }

  drawChart = ({ xName, yName, data: dataSet, title }: IDataProps) => {
    myChart = myChart || this.refs.main && echarts.init(this.refs.main, 'myTheme')
    if (!myChart) {
      return
    }

    const dataTar = {}
    const symbolArr = dataSet.map(ele => ele.count)
    const symbolMin = Math.min.apply(null, symbolArr)
    const symbolMax = Math.max.apply(null, symbolArr)
    const symbolRange = [10, 30]

    dataSet.forEach((ele, index) => {
      const { x, y, count, legend, data, label } = ele
      const symbolSize = symbolMax == count
        ? symbolRange[1]
        : (count - symbolMin) * (symbolRange[1] - symbolRange[0]) / (symbolMax - symbolMin) + symbolRange[0]
      dataTar[legend] = dataTar[legend] || []
      dataTar[legend].push([x, y, symbolSize, label, data])
    })

    const legend = []
    const series = []
    Object.entries(dataTar).forEach(([key, value]) => {
      legend.push(key)
      series.push({
        name: key,
        data: value,
        type: 'scatter',
        // label: {
        //   show: false,
        //   enterable: true,
        //   formatter: param => param.data[3]
        // },
        // emphasis: {
        //   label: {
        //     show: true,
        //   }
        // },
        symbolSize: (data) => data[2]
      })
    })
    const option = {
      series,
      title: {
        text: title
      },
      legend: {
        right: 10,
        type: 'scroll',
        data: legend
      },
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (fort) => this.props.tooltip(fort.data[4]),
      },
      xAxis: {
        name: xName,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        scale: true
      },
      yAxis: {
        name: yName,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        scale: true
      },
    }
    console.log(JSON.stringify(option))
    myChart.setOption(option, true)
  }

  componentDidMount() {
    myChart = echarts.init(this.refs.main, 'myTheme')
    this.drawChart(this.props)
  }

  render() {

    return (
      <div ref="main" style={{ width: '100%', height: '100%' }} />
    )
  }
}


export default Chart
