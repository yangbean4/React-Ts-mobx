import * as React from 'react'
import { observer } from 'mobx-react'
import { Placement, Campaign, PlacementCampaign } from '../type'
import { Select, Radio, Form } from 'antd'
import { computed, runInAction, observable, autorun } from 'mobx'

interface IProps {
  placementList: Placement[]
  campaignList: Campaign[]
  value: PlacementCampaign
  onChange?: (data: PlacementCampaign) => void
  disabled?: boolean
  hasSelect: string[]
  index: number
  form: any
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
    lg: { span: 10 },
    xl: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
    lg: { span: 14 },
    xl: { span: 12 }
  }
}

const typeList = [
  {
    label: 'Whitelist',
    value: 0
  },
  {
    label: 'Blacklist',
    value: 1
  }
]

@observer
class PlacementCampaignGroup extends React.Component<IProps> {

  private IReactionDisposer: () => void
  @observable
  private _campaignL = [] as Campaign[]

  constructor(props) {
    super(props)
    this.IReactionDisposer = autorun(
      () => {
        // REVIEW: campaignL
        // const { placementList, value } = this.props
        const _campaignL = this.campaignL
        // debugger
        const {
          index,
          value
        } = this.props
        const {
          campaign_id,
        } = value
        const hasFilter = campaign_id.filter(id => !!_campaignL.find(cam => cam.campaign_id == id))
        const isRender = hasFilter.length !== campaign_id.length
        if (isRender) {
          this.onChange({
            campaign_id: hasFilter
          })
          this.props.form.setFieldsValue({// 重新赋值
            [`__[${index}].campaign_id`]: hasFilter
          })
        }
        return isRender
      }
    )
  }
  @computed
  get campaignL() {
    return this._campaignL.length ? this._campaignL : this.props.campaignList || []
  }

  componentDidMount() {
    this.IReactionDisposer()
  }

  onChange = (data) => {
    const val = {
      ...this.props.value,
      ...data
    }

    // 避免出现不必要的更新,避免出现死循环
    if (JSON.stringify(this.props.value) !== JSON.stringify(val)) {
      this.props.onChange(val)
    }

  }
  setType = (val) => {
    this.onChange({ placement_id: val })
    const placement = this.props.placementList.find(ele => ele.placement_id === val) || { platform: '' }
    const _campaignL = this.props.campaignList.filter(ele => ele.platform === placement.platform)
    // const { campaign_id } = this.props.value
    // const _campaign_id = campaign_id.filter(ele=>)
    runInAction('set', () => {
      this._campaignL = _campaignL
    })
  }

  render() {
    const { value, placementList = [], disabled, hasSelect, form, index } = this.props
    const { getFieldDecorator } = form
    const { placement_id, type, campaign_id } = value
    return (
      <div>
        <Form.Item {...formItemLayout} label='Placement'>
          {
            getFieldDecorator(`__[${index}].placement_id`, {
              rules: [{ required: !!campaign_id.length, message: "Required" }],
              initialValue: placement_id
            })(
              <Select
                allowClear
                showSearch
                getPopupContainer={trigger => trigger.parentElement}
                // value={placement_id}
                onChange={this.setType}
                disabled={disabled}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {(placementList || []).map(c => (
                  <Select.Option disabled={hasSelect.includes(c.placement_id) && c.placement_id !== placement_id} value={c.placement_id} key={c.placement_id}>
                    {`${c.placement_name}-${c.placement_id}`}
                  </Select.Option>
                ))}
              </Select>
            )
          }

        </Form.Item>
        <Form.Item {...formItemLayout} label="White/Black Type">
          <Radio.Group disabled={disabled} options={typeList} onChange={e => this.onChange({ type: e.target.value })} value={type} />
        </Form.Item>
        <Form.Item {...formItemLayout} label='Campaign'>
          {
            getFieldDecorator(`__[${index}].campaign_id`, {
              rules: [{ required: !!placement_id, message: "Required" }],
              initialValue: campaign_id.map(ele => ele.toString())
            })(
              <Select
                className='inlineOption'
                showSearch
                disabled={disabled}
                mode="multiple"
                getPopupContainer={trigger => trigger.parentElement}
                // value={campaign_id.map(ele => ele.toString())}
                onChange={(val: string[]) => this.onChange({ campaign_id: val.map(ele => Number(ele)) })}
                filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {(this.campaignL).map((c, index) => (
                  <Select.Option value={c.campaign_id.toString()} key={c.campaign_id.toString() + index} style={c.campaign_status === 'suspend' && { color: '#999' }}>
                    {c.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            )}
        </Form.Item>
      </div>
    )
  }
}

export default PlacementCampaignGroup
