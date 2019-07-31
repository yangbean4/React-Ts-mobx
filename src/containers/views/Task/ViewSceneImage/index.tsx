import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { FormComponentProps } from 'antd/lib/form'
import { ComponentExt } from '@utils/reactExt'
import { Input, Checkbox } from 'antd'

import * as styles from './index.scss'

interface IProps {
    routerStore?: RouterStore
    sceneImageConfig?: any[]
}

@inject(
    (store: IStore): IProps => {
        const { taskStore, routerStore } = store
        const { sceneImageConfig } = taskStore
        return { routerStore, sceneImageConfig }
    }
)
@observer
class SceneModal extends ComponentExt<IProps & FormComponentProps> {

    componentWillMount() {
        if (!this.props.sceneImageConfig) {
            debugger
            this.props.routerStore.push(`/task`)
        }
    }

    render() {
        return (
            <div className='sb-form'>
                <div className={styles.viewModal}>
                    {(this.props.sceneImageConfig || []).map((v, index) => (
                        <div>
                            <div className={styles.imageList} key={index}>
                                {(v.scene_image_url || []).map(img => (
                                    <div className={styles.imagelistImg}>
                                        <img key={img} src={img} alt={img} />
                                    </div>
                                ))}
                            </div>
                            <div className={styles.imageInfo}>
                                <Input type="text" disabled value={`${v.scene_code} ${v.scene_name}`} style={{ width: '130px', marginRight: '10px' }} />
                                <Checkbox disabled checked={!!v.checked} >
                                    场景
                                </Checkbox>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

export default SceneModal
