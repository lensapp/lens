import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { cssNames } from "../../utils";
import { KubeObject } from "../../api/kube-object";
import { getSelectedDetails, showDetails } from "../../navigation";
import { ItemListLayout, ItemListLayoutProps } from "../item-object-list/item-list-layout";
import { KubeObjectStore } from "../../kube-object.store";
import { KubeObjectMenu } from "./kube-object-menu";
import { ItemObject } from "../../item.store";

export interface KubeObjectListLayoutProps<T extends ItemObject & KubeObject> extends ItemListLayoutProps<T> {
  store: KubeObjectStore<T>;
}

function showItemDetails(item: KubeObject) {
  return showDetails(item.selfLink);
}

@observer
export class KubeObjectListLayout<T extends ItemObject & KubeObject> extends React.Component<KubeObjectListLayoutProps<T>> {
  @computed get selectedItem() {
    return this.props.store.getByPath(getSelectedDetails());
  }

  static defaultProps = {
    onDetails: showItemDetails
  };

  render() {
    const { className, ...layoutProps } = this.props;

    return (
      <ItemListLayout
        {...layoutProps}
        className={cssNames("KubeObjectListLayout", className)}
        detailsItem={this.selectedItem}
        onDetails={this.props.onDetails}
        renderItemMenu={(item) => {
          return <KubeObjectMenu object={item}/>;
        }}
      />
    );
  }
}
