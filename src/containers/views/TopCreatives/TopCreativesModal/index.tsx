import React, { ReactNode } from 'react'
import { Modal, Radio, message, Button } from 'antd'
import { observer } from 'mobx-react'
import * as style from './index.scss'
import { computed, action, runInAction, observable, autorun } from 'mobx'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import MyIcon from '@components/Icon'

interface showType {
  name: string
  key: string
  // srcType: 'video' | 'image' | 'iframe'
  // btnType: 'copy' | 'lead'
}
interface btn {
  name: string
  btnType: 'copy' | 'lead',
  src: string
}

interface rightGroup {
  // tabList: showType[]
  main: {
    srcType: 'video' | 'image' | 'iframe'
    src: string
  }
  btnGroup: btn[]
}
const showTypeDic = {
  '1': [

  ],
  '2': [
    {
      name: 'Video',
      key: '0'
    }, {
      name: 'Endcard',
      key: '1'
    }
  ],
  '3': [
    {
      name: 'Lead Video',
      key: '0'
    }, {
      name: 'Lead Content',
      key: '1'
    }, {
      name: 'First Frame',
      key: '2'
    }, {
      name: 'Endcard',
      key: '3'
    }
  ]
}

interface IProp {
  visible: boolean
  onCancel: () => void
  data: ITopCreativeStore.ITopCreativeForList
}

@observer
class TopCreativesModal extends React.Component<IProp> {

  private IReactionDisposer: () => void


  @observable
  private tabType: string = '0'

  @computed
  get tabList(): showType[] {
    const creative_type = (this.props.data.preview || {}).creative_type
    return showTypeDic[creative_type]
  }

  // @computed
  // get btnGroup(): btn[] {

  // }

  constructor(props) {
    super(props)
    this.IReactionDisposer = autorun(() => {
      if (this.props.visible) {
        runInAction('INIT', () => {
          this.tabType = '0'
        })
      }
      return this.props.visible
    })
  }

  formatNumber = (num) => {
    return `${num}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  @computed
  get computedRight(): rightGroup {
    const creative_type = (this.props.data.preview || {}).creative_type

    const preview = this.props.data.preview || {}
    const { template_url = '', content = '', lead_content_image } = preview;
    const getEndcard = (): rightGroup => {
      const tempArr = (template_url || '').split('/')
      const nameArr = tempArr[tempArr.length - 1].split('.')
      const number = nameArr[0]
      const isZip = nameArr[1] === 'zip'
      const isBus = '005 / 006 / 007 / 008'.includes(number)
      return {
        main: {
          srcType: 'image',
          src: preview.endcard_image_url
        },
        btnGroup: [
          !isBus ? {
            name: 'Download Creative',
            src: preview.template_url,
            btnType: 'lead'
          } : {
              name: 'Copy Creative Url',
              src: preview.endcard_image_url,
              btnType: 'copy'
            }
        ]
      }
    }
    switch (creative_type || '1') {
      //IVE
      case '1':
        return {
          main: {
            srcType: 'iframe',
            src: preview.online_url
          },
          btnGroup: [
            {
              name: 'Copy Online Creative Url',
              src: preview.online_url,
              btnType: 'copy'
            }, {
              name: 'Download Offline Creative',
              src: preview.offline_url,
              btnType: 'lead'
            }
          ]
        }
      // VIDEO
      case '2':
        switch (this.tabType) {
          case '0': {
            return {
              main: {
                srcType: 'video',
                src: preview.creative_url
              },
              btnGroup: [
                {
                  name: 'Copy Creative Url',
                  src: preview.creative_url,
                  btnType: 'copy'
                }
              ]
            }
          }
          case '1': {
            return getEndcard()
          }
        }
      // 'IGE'
      case '3':
        switch (this.tabType) {
          case '0': {
            return {
              main: {
                srcType: 'video',
                src: preview.ige_leadvideo
              },
              btnGroup: [
                {
                  name: 'Copy Creative Url',
                  src: preview.ige_leadvideo,
                  btnType: 'copy'
                }
              ]
            }
          }
          case '1': {
            const arr = (content || '').split('.')
            const type = arr[arr.length - 1]
            return type === 'zip' ? {
              main: {
                srcType: 'image',
                src: lead_content_image
              },
              btnGroup: [
                {
                  name: 'Download Creative',
                  src: content,
                  btnType: 'lead'
                }
              ]
            } : {
                main: {
                  srcType: 'iframe',
                  src: content
                },
                btnGroup: [
                  {
                    name: 'Copy Creative Url',
                    src: content,
                    btnType: 'copy'
                  }
                ]
              }

          }

          case '2': {
            return {
              main: {
                srcType: 'image',
                src: preview.ige_firstframe_image_url
              },
              btnGroup: [
                {
                  name: 'Copy Creative Url',
                  src: preview.ige_firstframe_image_url,
                  btnType: 'copy'
                }
              ]
            }
          }

          case '3': {
            return getEndcard()
          }
        }

    }
  }


  componentWillUnmount() {
    this.IReactionDisposer()
  }

  @action
  typeChange = (e) => {
    const val = e.target.value
    runInAction('SET_TYPE', () => {
      this.tabType = val
    })
  }

  viewFile = (useUrl) => {
    window.open(useUrl)
  }
  onCopy = () => {
    message.success('copy success')
  }

  render() {
    const { onCancel, data } = this.props
    const { preview = {} } = data
    const { app_id, platform, data_duration } = preview
    const { main, btnGroup } = this.computedRight || {}
    return (
      <Modal
        title="Creative"
        destroyOnClose
        onCancel={onCancel}
        width={1086}
        footer={null}
        visible={this.props.visible}
      >
        <div className={style.main}>
          <div className={style.left}>
            <div>
              <div className={style.msg}>
                <div className={style.label}>
                  App ID
                </div>
                <div className={style.value}>
                  {app_id}
                </div>
              </div>
              <div className={style.msg}>
                <div className={style.label}>
                  Platform
                </div>
                <div className={style.value}>
                  {platform}
                </div>
              </div>
            </div>
            <div className={style.table}>
              <div className={style.title}>
                {data_duration}
              </div>
              <div className={style.list}>
                <div className={style.list1}>
                  <div className={style.card}>
                    <div className={style.tt}>Impression</div>
                    <div className={style.vv}>{this.formatNumber(preview.impression)}</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>Play</div>
                    <div className={style.vv}>{this.formatNumber(preview.play)}</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>Click</div>
                    <div className={style.vv}>{this.formatNumber(preview.click)}</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>Install</div>
                    <div className={style.vv}>{this.formatNumber(preview.install)}</div>
                  </div>
                </div>
                <div>
                  <div className={style.card}>
                    <div className={style.tt}>Play Rate</div>
                    <div className={style.vv}>{this.formatNumber(preview.play_rate)}%</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>CTR</div>
                    <div className={style.vv}>{this.formatNumber(preview.ctr)}%</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>CVR</div>
                    <div className={style.vv}>{this.formatNumber(preview.cvr)}%</div>
                  </div>
                  <div className={style.card}>
                    <div className={style.tt}>IPM</div>
                    <div className={style.vv}>{this.formatNumber(preview.ipm)}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={style.bottom}>
              <div className={style.msg}>
                <div className={style.label}>
                  Creative Type
                </div>
                <div className={style.value}>
                  {preview.creative_type_name}
                </div>
              </div>
              <div className={style.msg}>
                <div className={style.label}>
                  Creative
                </div>
                <div className={style.value}>
                  {preview.creative}
                </div>
              </div>
              {
                (preview.creative_type || '').toUpperCase() !== 'IVE' && <div className={style.msg}>
                  <div className={style.label}>
                    Endcard
                </div>
                  <div className={style.value}>
                    {preview.endcard}
                  </div>
                </div>
              }
              <div className={style.msg}>
                <div className={style.label}>
                  Campaign
                </div>
                <div className={style.value}>
                  {preview.campaign_num}
                </div>
              </div>
            </div>
          </div>
          <div className={style.right}>
            <div className={style.tab}>
              <Radio.Group onChange={this.typeChange} value={this.tabType}>
                {
                  (this.tabList || []).map(ele => {
                    return (<Radio.Button key={ele.key + ele.name} value={ele.key}>{ele.name}</Radio.Button>)
                  })
                }
              </Radio.Group>
            </div>
            <div className={style.busbox}>
              {
                !main.src ? <MyIcon type='iconpicture2' className={style.busIcon} /> : main.srcType === 'iframe' ? <iframe className={style.frame} src={main.src} /> :  main.srcType === 'video' ?  <video width="100%" height="100%" style={{ width: '100%' }} controls autoPlay src={main.src} /> : <img alt="example" style={{ maxHeight: '100%', display: 'block', margin: '0 auto', maxWidth: '100%' }} src={main.src} />
              }
            </div>
            <div className={style.btnBox}>
              {
                btnGroup.map(ele => {
                  return ele.btnType === 'copy' ?
                    <CopyToClipboard onCopy={this.onCopy} text={ele.src}><Button type="primary">{ele.name}</Button></CopyToClipboard>
                    : <Button type="primary" onClick={() => this.viewFile(ele.src)} >{ele.name}</Button>
                })
              }
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}


export default TopCreativesModal
