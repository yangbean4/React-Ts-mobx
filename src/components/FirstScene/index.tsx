// tslint:disable-next-line: jsdoc-format
/**
 * ex:
* 
import FirstScene, { formItemClassName } from '@components/FirstScene'
    <FormItem {...formItemMax} label="First Scene" className={formItemClassName}>
                        {getFieldDecorator('FirstScene', {
                            initialValue: [{
                                "id": 1,
                                "scene_image_url": ["http://aa.png", "http://bb.png"],
                                "sen_category_scene_config_id": 111,
                                "is_scene": 0
                            },
                            {
                                "id": 2,
                                "scene_image_url": ["http://cc.png", "http://dd.png"],
                                "sen_category_scene_config_id": 222,
                                "is_scene": 1
                            }
                            ],
                            rules: [
                                {
                                    required: true, message: "Required"
                                },
                                {
                                    validator: firstSceneValidator
                                }
                            ]
                        })(
                            <FirstScene
                                preData={{ app_id: 123 }}
                                api={this.api.util.uploadFirstSceneImage}
                                sceneTypeList={[{
                                    id: 111, name: 'aaaa'
                                }, {
                                    id: 222, name: 'bbbb'
                                }, {
                                    id: 333, name: 'cccc'
                                }]} />
                        )}
                    </FormItem>

 */


import React from 'react'
import * as styles from './index.scss'
import UploadFile, { UploadFileProps, FileWHT } from '@components/UploadFile'
import { Icon, Row, Col, Select, Checkbox, Modal, Button, message } from 'antd'
import MyIcon from '../Icon'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { observable, action, runInAction, observe } from 'mobx';
import { observer } from 'mobx-react'

interface Iprop {
  value?: sceneList[]
  onChange?: (data: sceneList[]) => void
  disabled?: boolean // 是否是查看 true：查看
  sceneTypeList?: sceneType[] // 待选场景列表
  preData?: object // 在上传图片的同时需要带的参数
  api?: (data: any) => Promise<any> // 在上传图片的同时调用的axios实例
}

interface sceneList {
  id?: number
  scene_image_url: string[]
  sen_category_scene_config_id: number
  is_scene: 0 | 1
}

interface sceneType {
  id: number // to  sen_category_scene_config_id
  name: string
}

const copy = (onj) => JSON.parse(JSON.stringify(onj))

@observer
class FirstScene extends React.Component<Iprop> {

  private upLoadProps = {
    wht: {
      size: 5000
    },
    preData: this.props.preData,
    api: this.props.api,
  }
  private defaultList = {
    scene_image_url: [],
    sen_category_scene_config_id: undefined,
    is_scene: 1
  }

  @observable
  private useUrl: string = ''

  @observable
  private previewVisible: boolean = false

  get hasUseType() {
    const arr = this.props.value.map(ele => ele.sen_category_scene_config_id)
    return new Set(arr)
  }

  @action
  handleCancel = () => {
    this.previewVisible = false
  }
  @action
  eyeClick = (img) => {
    runInAction("set", () => {
      this.previewVisible = true
      this.useUrl = img
    })
  }

  removeList = (index: number): void => {
    const arr = JSON.parse(JSON.stringify(this.props.value)) || []
    if (arr.length === 0) {
      return;
    } else {
      arr.splice(index, 1)
      this.props.onChange(arr)
    }
  }

  addList = (index): void => {
    const arr = JSON.parse(JSON.stringify(this.props.value)) || []
    arr.splice(index + 1, 0, { ...copy(this.defaultList) })
    this.props.onChange(arr)
  }

  listChange = (data, index) => {
    const value = JSON.parse(JSON.stringify(this.props.value))
    value[index] = {
      ...value[index],
      ...data
    }
    this.props.onChange(value)
  }

  imgAdd = (index: number, url: string) => {
    const value = JSON.parse(JSON.stringify(this.props.value))
    value[index].scene_image_url = (value[index].scene_image_url || []).concat(url)
    this.props.onChange(value)
  }

  removeImg = (imgIndex: number, listIndex: number, e: React.MouseEvent): void => {
    e.stopPropagation()

    const value = JSON.parse(JSON.stringify(this.props.value))
    const imgArr = value[listIndex].scene_image_url
    if (imgArr.length > 1) {
      imgArr.splice(imgIndex, 1)
      value[listIndex].scene_image_url = imgArr
      this.props.onChange(value)
    }
  }

  setType = (index, value) => {
    this.listChange({ sen_category_scene_config_id: value }, index)
  }

  is_sceneChange = (e, index) => {
    this.listChange({ is_scene: ~~e.target.checked }, index)
  }

  onCopy = () => {
    message.success('copy success')
  }


  render() {
    const value = this.props.value || []
    return (
      <div className={styles.FirstScene}>
        {
          value.map((ele, index) => {
            return (
              <div className={styles.SceneList} key={index}>
                <div className={styles.imgList}>
                  {
                    ele.scene_image_url.map((img, ind) => {
                      return (
                        <div key={img} className={styles.imgBox}>
                          {
                            !this.props.disabled && <div className={styles.zheZhao} onClick={() => this.eyeClick(img)}>
                              <Icon onClick={(e) => this.removeImg(ind, index, e)} className={styles.closeIcon} type="close" />
                            </div>
                          }
                          <img src={img} className={styles.img} />
                        </div>
                      )
                    })
                  }
                  {
                    !this.props.disabled && <UploadFile
                      className={styles.uploadGroup}
                      {...this.upLoadProps}
                      onChange={(url) => this.imgAdd(index, url)}
                    >
                      <Icon type='plus' />
                    </UploadFile>
                  }

                </div>
                <div className={styles.titleGroup}>
                  <div className={styles.select}>
                    <Select
                      showSearch
                      disabled={this.props.disabled}
                      value={ele.sen_category_scene_config_id}
                      onChange={(val) => this.setType(index, val)}
                      filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {this.props.sceneTypeList.map(c => (
                        <Select.Option disabled={c.id !== ele.sen_category_scene_config_id && this.hasUseType.has(c.id)} value={c.id} key={c.id}>
                          {c.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Checkbox disabled={this.props.disabled} checked={!!ele.is_scene} onChange={e => this.is_sceneChange(e, index)} >
                      场景
                  </Checkbox>
                  </div>
                  <div>

                    <MyIcon
                      className={styles.dynamic}
                      type="icontianjia"
                      onClick={() => this.addList(index)}
                    />
                  </div>
                  <div>
                    <MyIcon
                      className={styles.dynamic}
                      type="iconjianshao"
                      onClick={() => this.removeList(index)} />
                  </div>
                </div>
              </div>
            )
          })
        }

        <Modal
          destroyOnClose
          visible={this.previewVisible}
          width={680}
          onCancel={this.handleCancel}
          footer={((<CopyToClipboard onCopy={this.onCopy} text={this.useUrl}><Button type="primary">Copy Url</Button></CopyToClipboard>))}
        >
          <React.Fragment>
            <img alt="example" style={{ maxHeight: '600px', display: 'block', margin: '0 auto', maxWidth: '100%' }} src={this.useUrl} />
            <div className={styles.linkUrlWrapper}>
              <div className={styles.label}> Url</div>
              <div className={styles.linkUrl}>{this.useUrl}</div>
            </div>
          </React.Fragment>
        </Modal>
      </div>
    )
  }

}



export default FirstScene

export const formItemClassName = styles.formItemClassName

// 添加默认的校验规则
export const firstSceneValidator = (r, v, callback) => {
  // const reg = /^[0-9]*$/;
  // if (!reg.test(v)) {
  //   callback('The Exchange Rate should be a positive integer!')
  // }
  callback()
}
