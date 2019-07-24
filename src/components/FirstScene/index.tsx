import React from 'react'


interface sceneItem {
  id?: number
  scene_image_url: string
  sen_category_scene_config_id: number
  is_scene: 0 | 1
}

interface Iprop {
  value?: sceneItem[]
  onChange?: (data: sceneItem[]) => void
  disabled?: boolean
}

class FirstScene extends React.Component<Iprop> {

  render() {
    const value = this.props.value || []
    return (
      <div>
        {
          value.map(ele => {

          })
        }
      </div>
    )
  }

}

export default FirstScene
