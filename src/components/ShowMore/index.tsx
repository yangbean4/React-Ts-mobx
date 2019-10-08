import * as React from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import * as styles from './index.scss';

interface IProps {
    minHeight?: number
}

@observer
class ShowMore extends React.Component<IProps> {
    @observable
    private isShowMore: boolean = false

    @action
    toggle = () => {
        this.isShowMore = !this.isShowMore;
    }

    componentDidMount() {
        const div = this.refs.div as HTMLElement;
        const event = document.createEvent('UIEvent');
        event.initEvent('resize', true, true);

        div.addEventListener('transitionend', (e) => {
            if (e.target !== div) return;
            window.dispatchEvent(event);
        })
    }

    render() {
        const {
            children,
            minHeight = 68
        } = this.props
        const classname = this.isShowMore ? styles.more : `${styles.more} ${styles.hide}`;

        return <div className={styles.wp}>
            <div ref="div" className={styles.content} style={this.isShowMore ? {} : { maxHeight: minHeight }}>
                {children}
            </div>
            <div className={classname} onClick={this.toggle}></div>
        </div>
    }
}

export default ShowMore;
