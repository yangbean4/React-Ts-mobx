import * as React from 'react'
import { observer } from 'mobx-react'
import { Placement, Campaign, PlacementCampaign } from '../type'
import { Select, Radio, Form } from 'antd'
import { computed, runInAction, observable, autorun, _allowStateChangesInsideComputed } from 'mobx'

interface IProps {
  placementList: Placement[]
  campaignList: Campaign[]
  value: PlacementCampaign
  onChange?: (data: PlacementCampaign) => void
  disabled?: boolean
  hasSelect: string[]
  index: number
  form: any
  test: boolean
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
  private hasError = ''

  @observable
  private errorTarget = {
    campaign_id: false,
    placement_id: false
  }

  @observable
  private _campaignL = [] as Campaign[]


  @computed
  get campaignL() {
    return this._campaignL.length ? this._campaignL : this.props.campaignList || []
  }

  constructor(props) {
    super(props)
    autorun(() => {
      // debugger
      const {
        test,
        value
      } = this.props
      const {
        placement_id, campaign_id
      } = value
      const hasError = Number(!!placement_id) + Number(!!campaign_id.length)
      let errorTarget;
      if (test) {
        errorTarget = hasError === 1 ? {
          campaign_id: !campaign_id.length,
          placement_id: !placement_id
        } : {
            campaign_id: false,
            placement_id: false
          }
      } else {
        const error = this.errorTarget
        errorTarget = {
          campaign_id: error.campaign_id && !campaign_id.length,
          placement_id: error.placement_id && !placement_id
        }
      }

      const noRender = Object.keys(errorTarget).every(key => errorTarget[key] === this.errorTarget[key])
      if (!noRender) {
        runInAction('sw', () => {
          this.errorTarget = errorTarget
        })
      }

    })
  }

  componentDidMount() {
    // this.IReactionDisposer()
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
    runInAction('set', () => {
      this._campaignL = _campaignL
    })
  }

  render() {
    const { value, placementList = [], disabled, hasSelect, form, } = this.props
    const { placement_id, type, campaign_id = [] } = value
    const getMsg = (type: string): { help?: string, validateStatus?: 'error' } => this.errorTarget[type] ? {
      help: 'Required',
      validateStatus: 'error'
    } : {}
    return (
      <div>
        <Form.Item {...formItemLayout} {...getMsg('placement_id')} required={!!campaign_id.length} label='Placement'>
          {/* {
            getFieldDecorator(`placement_campaign[${index}].placement_id`, {
              rules: [{ required: !!campaign_id.length, message: "Required" }],
              initialValue: placement_id
            })(

            )
          } */}

          <Select
            allowClear
            showSearch
            getPopupContainer={trigger => trigger.parentElement}
            value={placement_id}
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

        </Form.Item>
        <Form.Item {...formItemLayout} label="White/Black Type">
          {/* {
            getFieldDecorator(`placement_campaign[${index}].type`, {
              initialValue: type
            })()
          } */}
          <Radio.Group disabled={disabled} value={type} options={typeList} onChange={e => this.onChange({ type: e.target.value })} />
        </Form.Item>
        <Form.Item {...formItemLayout} {...getMsg('campaign_id')} required={!!placement_id} label='Campaign'>
          {/* {
            getFieldDecorator(`placement_campaign[${index}].campaign_id`, {
              rules: [{ required: !!placement_id, message: "Required" }],
              initialValue: campaign_id.map(ele => ele.toString())
            })(
        )} */}
          <Select
            className='inlineOption'
            showSearch
            disabled={disabled}
            mode="multiple"
            getPopupContainer={trigger => trigger.parentElement}
            value={campaign_id.map(ele => ele.toString())}
            onChange={(val: string[]) => this.onChange({ campaign_id: val.map(ele => Number(ele)) })}
            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {(this.campaignL).map((c, index) => (
              <Select.Option value={c.campaign_id.toString()} key={c.campaign_id.toString() + index} style={c.campaign_status === 'suspend' && { color: '#999' }}>
                {`${c.campaign_id}-${c.campaign_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </div>
    )
  }
}

export default PlacementCampaignGroup
