import React from 'react';
import { inject, observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { Breadcrumb } from 'antd'
import menu, { router, IMenu, templateId, logId } from '../menu&router'
import pathToRegexp from 'path-to-regexp'
import * as styles from './style.scss'

interface IStoreProps {
  routerStore?: RouterStore
  tmpSidebar?: IAuthStore.Sidebar[]
}

@inject(
  (store: IStore): IStoreProps => {
    const { routerStore, authStore } = store
    const { tmpSidebar } = authStore

    return {
      routerStore,
      tmpSidebar,
    }
  }
)
@observer
class Bread extends React.Component<IStoreProps> {

  @computed
  get addSideBar() {
    const merge = (pop, tmp) => {
      const addTmp: IMenu[] = tmp.map((item, index) => {
        return {
          pid: templateId,
          id: (templateId * 1000) + index,
          component: "Template",
          title: item.primary_name,
          path: `/template/${encodeURI(item.id)}`
        }
      })
      const addLog: IMenu[] = tmp.map((item, index) => {
        return {
          pid: logId,
          id: (logId * 1000) + index,
          component: "Logs",
          title: item.primary_name,
          path: `/log/${(item.primary_name)}`
        }
      })
      return pop.concat(addTmp, addLog)
    }
    return merge([], this.props.tmpSidebar)
  }

  @computed
  get menuConfig() {
    return [].concat.call(menu, this.addSideBar)
  }
  @computed
  get routerConfig() {
    return [].concat.call(router, this.addSideBar)
  }
  @computed
  get allConfig() {
    return [].concat.call(menu, this.addSideBar, router)
  }

  @computed
  get currentRoute() {
    return this.props.routerStore.location.pathname
  }

  @computed
  get currentMenu() {
    return this.allConfig.find(ele => ele.path && pathToRegexp(ele.path).exec(this.currentRoute))
  }

  @computed
  get getPathArray() {
    const array = this.allConfig
    const current = this.currentMenu
    const result = []
    const getPath = (item: IMenu): void => {
      if (item && item.pid && item.hasBread !== false) {
        result.unshift(item)
        const pItem = array.find(ele => ele.id == item.pid)
        getPath(pItem)
      }
    }
    getPath(current)
    // //console.log(result)
    // result.shift()
    return result
  }
  goto = (ele, index, arr) => {
    if (arr.length > 1 && index === 0 && ele.path) {
      this.props.routerStore.push(ele.path)
    }
  }

  render() {
    return (
      <div className={styles.myBread}>
        <Breadcrumb separator=">">
          {
            this.getPathArray.map((ele, index, arr) => (
              <Breadcrumb.Item onClick={() => this.goto(ele, index, arr)} key={ele.id}>{ele.title}</Breadcrumb.Item>
            ))
          }
        </Breadcrumb>
      </div>

    )
  }
}

export default Bread
