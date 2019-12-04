import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Button, Modal, Input } from 'antd'
import Search from './Search'
import { ComponentExt } from '@utils/reactExt'
import PortalsBtn from '@components/portalsBtn'
import { observable, action } from 'mobx'

interface IStoreProps {
    routerStore?: RouterStore
    create?: (item) => Promise<any>
    getList?: () => Promise<any>
}

@inject(
    (store: IStore): IStoreProps => {
        const { routerStore, StrategyGroupStore } = store
        const { create, getList } = StrategyGroupStore;
        return {
            routerStore,
            create,
            getList
        }
    }
)
@observer
class Header extends ComponentExt<IStoreProps> {
    @observable
    private modalVisible = false;

    @observable
    private loading = false;

    private strategyName = '';

    @action
    showModal = () => this.modalVisible = true;

    @action
    taggleLoading = () => this.loading = !this.loading;

    @action
    hideModal = () => this.modalVisible = false;

    setName = (e) => this.strategyName = e.target.value;

    add = async () => {
        if (this.strategyName) {
            this.taggleLoading();
            try {
                await this.props.create({
                    strategy_name: this.strategyName
                });
                this.props.getList();

            } catch (e) { }
            this.taggleLoading();
        }
        this.hideModal();
    }

    render() {
        return (
            <div className='searchForm'>
                <Search />
                {
                    this.$checkAuth('Apps-Strategy Group', (
                        <PortalsBtn querySelector='#whiteBlackAddBtn'>
                            <Button icon='plus' type="primary" onClick={this.showModal}>
                                Add
                        </Button>
                        </PortalsBtn>

                    ))
                }
                <Modal
                    title="Add Strategy Group"
                    visible={this.modalVisible}
                    onOk={this.add}
                    onCancel={this.hideModal}
                    okText="Add"
                    confirmLoading={this.loading}
                    destroyOnClose={true}
                    width={400}
                >
                    <Input placeholder="Please input strategy name" onInput={this.setName}></Input>
                </Modal>
            </div>
        )
    }
}

export default Header
