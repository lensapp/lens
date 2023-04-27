/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-list-layout.scss";

import React from "react";
import { computed, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Disposer } from "@k8slens/utilities";
import { hasTypedProperty, isObject, isString, cssNames, isDefined } from "@k8slens/utilities";
import type { KubeJsonApiDataFor, KubeObject } from "@k8slens/kube-object";
import type { ItemListLayoutProps, ItemListStore } from "../item-object-list/list-layout";
import { ItemListLayout } from "../item-object-list/list-layout";
import { KubeObjectMenu } from "../kube-object-menu";
import { NamespaceSelectFilter } from "../namespaces/namespace-select-filter";
import { ResourceKindMap, ResourceNames } from "../../utils/rbac";
import { Icon } from "../icon";
import { TooltipPosition } from "@k8slens/tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import type { SubscribableStore, SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { PageParam } from "../../navigation/page-param";
import type { ToggleKubeDetailsPane } from "../kube-detail-params/toggle-details.injectable";
import kubeSelectedUrlParamInjectable from "../kube-detail-params/kube-selected-url.injectable";
import toggleKubeDetailsPaneInjectable from "../kube-detail-params/toggle-details.injectable";
import type { ClusterContext } from "../../cluster-frame-context/cluster-frame-context";
import type { GeneralKubeObjectListLayoutColumn, SpecificKubeListLayoutColumn } from "@k8slens/list-layout";
import { kubeObjectListLayoutColumnInjectionToken } from "@k8slens/list-layout";
import { sortBy } from "lodash";

export type KubeItemListStore<K extends KubeObject> = ItemListStore<K, false> & SubscribableStore & {
  getByPath: (path: string) => K | undefined;
  readonly contextItems: K[];
};

export interface KubeObjectListLayoutProps<
  K extends KubeObject,
  // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-unused-vars
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K>,
> extends Omit<ItemListLayoutProps<K, false>, "getItems" | "dependentStores" | "preloadStores"> {
  items?: K[];
  getItems?: () => K[];
  store: KubeItemListStore<K>;
  dependentStores?: SubscribableStore[];
  subscribeStores?: boolean;

  /**
   * Customize resource name for e.g. search input ("Search <ResourceName>..."")
   * If not provided, ResourceNames is used instead with a fallback to resource kind.
   */
  resourceName?: string;
  columns?: SpecificKubeListLayoutColumn<K>[];
}

interface Dependencies {
  clusterFrameContext: ClusterContext;
  subscribeToStores: SubscribeStores;
  kubeSelectedUrlParam: PageParam<string>;
  toggleKubeDetailsPane: ToggleKubeDetailsPane;
  generalColumns: GeneralKubeObjectListLayoutColumn[];
}

const matchesApiFor = (api: SubscribableStore["api"]) => (column: GeneralKubeObjectListLayoutColumn) => (
  column.kind === api.kind
  && (
    isString(api.apiVersionWithGroup)
      ? [column.apiVersion].flat().includes(api.apiVersionWithGroup)
      : true
  )
);

const getLoadErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.cause) {
      return `${error.message}: ${getLoadErrorMessage(error.cause)}`;
    }

    return error.message;
  }

  if (isObject(error) && hasTypedProperty(error, "message", isString)) {
    return error.message;
  }

  return `${String(error)}`;
};

@observer
class NonInjectedKubeObjectListLayout<
  K extends KubeObject,
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K>,
> extends React.Component<KubeObjectListLayoutProps<K, A, D> & Dependencies> {
  static defaultProps = {
    subscribeStores: true,
  };

  private readonly loadErrors = observable.array<string>();

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
          onLoadFailure: error => {
            this.loadErrors.push(getLoadErrorMessage(error));
          },
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
      toggleKubeDetailsPane: toggleDetails,
      onDetails,
      renderTableContents,
      renderTableHeader,
      columns,
      generalColumns,
      sortingCallbacks = {},
      ...layoutProps
    } = this.props;
    const resourceName = this.props.resourceName || ResourceNames[ResourceKindMap[store.api.kind]] || store.api.kind;
    const targetColumns = [
      ...(columns ?? []),
      ...generalColumns.filter(matchesApiFor(store.api)),
    ];

    void items;
    void dependentStores;

    targetColumns.forEach((col) => {
      if (col.sortingCallBack) {
        sortingCallbacks[col.id] = col.sortingCallBack;
      }
    });

    const headers = sortBy([
      ...(renderTableHeader || []).map((header, index) => ({ priority: (20 - index), header })),
      ...targetColumns,
    ], (v) => -v.priority).map((col) => col.header);

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
              placeholder: `Search ${resourceName}...`,
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
        sortingCallbacks={sortingCallbacks}
        renderTableHeader={headers}
        renderTableContents={(item) => (
          sortBy(
            [
              ...(renderTableContents(item).map((content, index) => ({ priority: (20 - index), content }))),
              ...targetColumns.map((col) => ({ priority: col.priority, content: col.content(item) })),
            ],
            (item) => -item.priority,
          )
            .map((value) => value.content)
        )}
        spinnerTestId="kube-object-list-layout-spinner"
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
    clusterFrameContext: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
    subscribeToStores: di.inject(subscribeStoresInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    toggleKubeDetailsPane: di.inject(toggleKubeDetailsPaneInjectable),
    generalColumns: di.injectMany(kubeObjectListLayoutColumnInjectionToken),
  }),
}) as <
  K extends KubeObject,
  A extends KubeApi<K, D>,
  D extends KubeJsonApiDataFor<K> = KubeJsonApiDataFor<K>,
>(props: KubeObjectListLayoutProps<K, A, D>) => React.ReactElement;
