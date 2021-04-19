import React from "react";
import { computed } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { cssNames } from "../../utils";
import { KubeObject } from "../../api/kube-object";
import { ItemListLayout, ItemListLayoutProps } from "../item-object-list/item-list-layout";
import { KubeObjectStore } from "../../kube-object.store";
import { KubeObjectMenu } from "./kube-object-menu";
import { kubeSelectedUrlParam, showDetails } from "./kube-object-details";
import { kubeWatchApi } from "../../api/kube-watch-api";
import { clusterContext } from "../context";

export interface KubeObjectListLayoutProps extends ItemListLayoutProps {
  store: KubeObjectStore;
  dependentStores?: KubeObjectStore[];
}

const defaultProps: Partial<KubeObjectListLayoutProps> = {
  onDetails: (item: KubeObject) => showDetails(item.selfLink),
};

@observer
export class KubeObjectListLayout extends React.Component<KubeObjectListLayoutProps> {
  static defaultProps = defaultProps as object;

  @computed get selectedItem() {
    return this.props.store.getByPath(kubeSelectedUrlParam.get());
  }

  componentDidMount() {
    const { store, dependentStores = [] } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));

    disposeOnUnmount(this, [
      kubeWatchApi.subscribeStores(stores, {
        preload: true,
        namespaces: clusterContext.contextNamespaces,
      })
    ]);
  }

  render() {
    const { className, store, items = store.contextItems, ...layoutProps } = this.props;

    return (
      <ItemListLayout
        {...layoutProps}
        className={cssNames("KubeObjectListLayout", className)}
        store={store}
        items={items}
        preloadStores={false} // loading handled in kubeWatchApi.subscribeStores()
        detailsItem={this.selectedItem}
        renderItemMenu={(item: KubeObject) => <KubeObjectMenu object={item} />} // safe because we are dealing with KubeObjects here
      />
    );
  }
}
