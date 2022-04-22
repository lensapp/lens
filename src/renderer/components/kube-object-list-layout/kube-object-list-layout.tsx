/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-list-layout.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Disposer } from "../../utils";
import { cssNames, isDefined } from "../../utils";
import type { KubeJsonApiDataFor, KubeObject } from "../../../common/k8s-api/kube-object";
import type { ItemListLayoutProps } from "../item-object-list/list-layout";
import { ItemListLayout } from "../item-object-list/list-layout";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectMenu } from "../kube-object-menu";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { ResourceKindMap, ResourceNames } from "../../utils/rbac";
import { Icon } from "../icon";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import type { SubscribableStore, SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PageParam } from "../../navigation";
import type { ToggleDetails } from "../kube-detail-params/toggle-details.injectable";
import kubeSelectedUrlParamInjectable from "../kube-detail-params/kube-selected-url.injectable";
import toggleDetailsInjectable from "../kube-detail-params/toggle-details.injectable";

export interface KubeObjectListLayoutProps<
  K extends KubeObject,
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K>,
> extends Omit<ItemListLayoutProps<K, false>, "getItems" | "dependentStores" | "preloadStores"> {
  items?: K[];
  getItems?: () => K[];
  store: KubeObjectStore<K, A, D>;
  dependentStores?: SubscribableStore[];
  subscribeStores?: boolean;
}

interface Dependencies {
  clusterFrameContext: ClusterFrameContext;
  subscribeToStores: SubscribeStores;
  kubeSelectedUrlParam: PageParam<string>;
  toggleDetails: ToggleDetails;
}

@observer
class NonInjectedKubeObjectListLayout<
  K extends KubeObject,
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K>,
> extends React.Component<KubeObjectListLayoutProps<K, A, D> & Dependencies> {
  static defaultProps = {
    subscribeStores: true,
  };

  private loadErrors = observable.array<string>();

  @computed get selectedItem() {
    return this.props.store.getByPath(this.props.kubeSelectedUrlParam.get());
  }

  componentDidMount() {
    const { store, dependentStores = [], subscribeStores } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));
    const reactions: Disposer[] = [
      reaction(() => this.props.clusterFrameContext.contextNamespaces.slice(), () => {
        // clear load errors
        this.loadErrors.length = 0;
      }),
    ];

    if (subscribeStores) {
      reactions.push(
        this.props.subscribeToStores(stores, {
          onLoadFailure: error => this.loadErrors.push(String(error)),
        }),
      );
    }

    disposeOnUnmount(this, reactions);
  }

  renderLoadErrors() {
    if (this.loadErrors.length === 0) {
      return null;
    }

    return (
      <Icon
        material="warning"
        className="load-error"
        tooltip={{
          children: (
            <>
              {this.loadErrors.map((error, index) => <p key={index}>{error}</p>)}
            </>
          ),
          preferredPositions: TooltipPosition.BOTTOM,
        }}
      />
    );
  }

  render() {
    const {
      className,
      customizeHeader,
      store,
      items,
      dependentStores,
      toggleDetails,
      onDetails,
      ...layoutProps
    } = this.props;
    const placeholderString = ResourceNames[ResourceKindMap[store.api.kind]] || store.api.kind;

    return (
      <ItemListLayout<K, false>
        className={cssNames("KubeObjectListLayout", className)}
        store={store}
        getItems={() => this.props.items || store.contextItems}
        preloadStores={false} // loading handled in kubeWatchApi.subscribeStores()
        detailsItem={this.selectedItem}
        customizeHeader={[
          ({ filters, searchProps, info, ...headerPlaceHolders }) => ({
            filters: (
              <>
                {filters}
                {store.api.isNamespaced && <NamespaceSelectFilter id="kube-object-list-layout-namespace-select-input" />}
              </>
            ),
            searchProps: {
              ...searchProps,
              placeholder: `Search ${placeholderString}...`,
            },
            info: (
              <>
                {info}
                {this.renderLoadErrors()}
              </>
            ),
            ...headerPlaceHolders,
          }),
          ...[customizeHeader].filter(isDefined).flat(),
        ]}
        renderItemMenu={item => <KubeObjectMenu object={item} />}
        onDetails={onDetails ?? ((item) => toggleDetails(item.selfLink))}
        {...layoutProps}
      />
    );
  }
}

export const KubeObjectListLayout = withInjectables<
  Dependencies,
  KubeObjectListLayoutProps<KubeObject, KubeApi<KubeObject, KubeJsonApiDataFor<KubeObject>>, KubeJsonApiDataFor<KubeObject>>
>(NonInjectedKubeObjectListLayout, {
  getProps: (di, props) => ({
    ...props,
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
    subscribeToStores: di.inject(subscribeStoresInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    toggleDetails: di.inject(toggleDetailsInjectable),
  }),
}) as <
  K extends KubeObject,
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K> = KubeJsonApiDataFor<K>,
>(props: KubeObjectListLayoutProps<K, A, D>) => React.ReactElement;
