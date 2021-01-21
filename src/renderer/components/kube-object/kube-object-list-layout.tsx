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

export interface KubeObjectListLayoutProps extends ItemListLayoutProps {
  store: KubeObjectStore;
  dependentStores?: KubeObjectStore[];
}

@observer
export class KubeObjectListLayout extends React.Component<KubeObjectListLayoutProps> {
  @computed get selectedItem() {
    return this.props.store.getByPath(kubeSelectedUrlParam.get());
  }

  async componentDidMount() {
    const { store, dependentStores } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));

    disposeOnUnmount(this, [
      await kubeWatchApi.subscribeStores(stores)
    ]);
  }

  onDetails = (item: KubeObject) => {
    if (this.props.onDetails) {
      this.props.onDetails(item);
    } else {
      showDetails(item.selfLink);
    }
  };

  render() {
    const { className, ...layoutProps } = this.props;

    return (
      <ItemListLayout
        {...layoutProps}
        className={cssNames("KubeObjectListLayout", className)}
        detailsItem={this.selectedItem}
        onDetails={this.onDetails}
        renderItemMenu={(item) => {
          return <KubeObjectMenu object={item}/>;
        }}
      />
    );
  }
}
