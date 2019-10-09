import * as React from 'react'
import { observer } from 'mobx-react'
import { computed, when, autorun } from 'mobx'
import PlacementCampaignItem from './PlacementCampaign'
import { Placement, Campaign, PlacementCampaign } from './type'
import MyIcon from '@components/Icon'
import * as styles from './index.scss'

interface IProps {
  placementList: Placement[]
  campaignList: Campaign[]
  value?: PlacementCampaign[]
  onChange?: (data: PlacementCampaign[]) => void
  disabled?: boolean
}

const copy = obj => JSON.parse(JSON.stringify(obj))

@observer
class PlacementCampaignGroup extends React.Component<IProps> {
  private defaultItem = {
    placement_id: '',
    type: 0,
    campaign_id: []
  }
  private IReactionDisposer: () => void
  constructor(props) {
    super(props)
    autorun(
      // 一旦...
      () => {
        if (!this.props.value.length) {
          this.setDefault()
        }
      }
    )
    this.IReactionDisposer = autorun(
      () => {
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

  setDefault = () => {
    this.props.onChange([
      { ...copy(this.defaultItem) }
    ])
  }

  addList = (index: number): void => {
    if (this.props.disabled) return;
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
    const { value, placementList, campaignList, disabled } = this.props
    return (
      <div>
        {
          value.map((item, index) => {
            return <div key={item.placement_id + index} className={styles.group}>
              <div className={styles.item}>
                <PlacementCampaignItem
                  hasSelect={this.hasSelect}
                  placementList={placementList}
                  campaignList={campaignList}
                  value={item}
                  disabled={disabled}
                  onChange={(data) => this.itemChange(data, index)}
                />
              </div>
              <div className={styles.btngroup}>
                <div>
                  <MyIcon
                    className={styles.dynamic}
                    type="icontianjia"
                    onClick={() => this.addList(index)}
                  />
                </div>
                {value.length > 1 ?
                  <div>
                    <MyIcon
                      className={styles.dynamic}
                      type="iconjianshao"
                      onClick={() => this.removeList(index)} />
                  </div> : null
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
