import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, when, autorun } from 'mobx'
import PlacementCampaignItem from './PlacementCampaign'
import { Placement, Campaign, PlacementCampaign } from './type'
import MyIcon from '@components/Icon'
import { Icon, Button } from 'antd';
import * as styles from './index.scss'

interface IProps {
  placementList: Placement[]
  campaignList: Campaign[]
  value?: PlacementCampaign[]
  blacklist: String[]
  onChange?: (data: PlacementCampaign[]) => void
  disabled?: boolean
  childTest: boolean
  form: any
}

const copy = obj => JSON.parse(JSON.stringify(obj))
const getKey = () => Math.random().toString()
const NODE_KEY = '_key_'
@observer
class PlacementCampaignGroup extends React.Component<IProps> {
  @computed
  get defaultItem() {
    return {
      placement_id: '',
      type: 0,
      campaign_id: [],
      [NODE_KEY]: getKey()
    }
  }
  private IReactionDisposer: () => void
  constructor(props) {
    super(props)
    autorun(
      // 一旦...
      () => {
        // debugger
        const value = this.props.value
        if (!value.length) {
          this.setDefault()
        } else if (!!value.find(ele => !(NODE_KEY in ele))) {
          const arr = copy(this.props.value).map(ele => {
            return {
              [NODE_KEY]: getKey(),
              ...ele,
            }
          })
          this.props.onChange(arr)
        }
      }
    )
    this.IReactionDisposer = autorun(
      () => {
        // debugger
        const { placementList, value } = this.props
        const _hasValue = this.hasSelect.filter(id => !!placementList.find(ele => ele.placement_id === id))
        const isRender = _hasValue.length !== this.hasSelect.length
        if (isRender) {
          const _val = value.filter(ele => _hasValue.includes(ele.placement_id))
          this.props.onChange(_val)
        }
        return isRender
      }
    )
  }


  @computed
  get hasSelect() {
    return this.props.value.map(ele => ele.placement_id)
  }

  @computed
  get noPlus() {
    return this.hasSelect.length === this.props.placementList.length
  }

  setDefault = () => {
    this.props.onChange([
      { ...copy(this.defaultItem) }
    ])
  }

  addList = (index: number): void => {
    if (this.hasSelect.length === this.props.placementList.length) {
      return
    }
    const arr = copy(this.props.value)
    arr.splice(index + 1, 0, { ...copy(this.defaultItem) })
    this.props.onChange(arr)
  }

  removeList = (index: number): void => {
    if (this.props.disabled) return;
    const arr = copy(this.props.value)
    if (arr.length === 0) {
      return
    } else {
      arr.splice(index, 1)
      this.props.onChange(arr)
    }
  }

  itemChange = (item, index) => {
    const arr = copy(this.props.value)
    arr[index] = item
    this.props.onChange(arr)
  }



  componentDidMount() {
    this.IReactionDisposer()
  }

  render() {
    const { value, placementList, campaignList, disabled, childTest, blacklist } = this.props
    return (
      <div>
        {
          [...value].map((item, index) => {
            return <div key={item[NODE_KEY] + index.toString()} className={styles.group}>
              <div className={styles.item}>
                <PlacementCampaignItem
                  hasSelect={this.hasSelect}
                  placementList={placementList}
                  campaignList={campaignList}
                  blacklist={blacklist}
                  value={item}
                  test={childTest}
                  index={index}
                  form={this.props.form}
                  disabled={disabled}
                  onChange={(data) => this.itemChange(data, index)}
                />
              </div>
              <div className={styles.btngroup}>
                <Button disabled={this.noPlus || disabled} icon="plus" className={styles.dynamic} onClick={() => this.addList(index)} />
                {value.length > 1 ?
                  <Button disabled={disabled} icon="minus" className={styles.dynamic} onClick={() => this.removeList(index)} />
                  : null
                }
              </div>
            </div>
          })
        }
      </div>
    )
  }
}

export default PlacementCampaignGroup
