/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-details.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "@k8slens/utilities";
import { Namespace } from "@k8slens/kube-object";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Link } from "react-router-dom";
import { Spinner } from "../spinner";
import { withInjectables } from "@ogre-tools/injectable-react";

import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { GetDetailsUrl } from "../kube-detail-params/get-details-url.injectable";
import type { ResourceQuotaStore } from "../config-resource-quotas/store";
import type { LimitRangeStore } from "../config-limit-ranges/store";
import getDetailsUrlInjectable from "../kube-detail-params/get-details-url.injectable";
import limitRangeStoreInjectable from "../config-limit-ranges/store.injectable";
import resourceQuotaStoreInjectable from "../config-resource-quotas/store.injectable";
import type { Logger } from "../../../common/logger";
import loggerInjectable from "../../../common/logger.injectable";
import { NamespaceTreeView } from "./namespace-tree-view";
import namespaceStoreInjectable from "./store.injectable";
import type { NamespaceStore } from "./store";

export interface NamespaceDetailsProps extends KubeObjectDetailsProps<Namespace> {
}

interface Dependencies {
  subscribeStores: SubscribeStores;
  getDetailsUrl: GetDetailsUrl;
  resourceQuotaStore: ResourceQuotaStore;
  limitRangeStore: LimitRangeStore;
  namespaceStore: NamespaceStore;
  logger: Logger;
}

@observer
class NonInjectedNamespaceDetails extends React.Component<NamespaceDetailsProps & Dependencies> {
  constructor(props: NamespaceDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.resourceQuotaStore,
        this.props.limitRangeStore,
      ]),
    ]);
  }

  @computed get quotas() {
    const namespace = this.props.object.getName();

    return this.props.resourceQuotaStore.getAllByNs(namespace);
  }

  @computed get limitranges() {
    const namespace = this.props.object.getName();

    return this.props.limitRangeStore.getAllByNs(namespace);
  }

  render() {
    const { object: namespace, resourceQuotaStore, getDetailsUrl, limitRangeStore } = this.props;

    if (!namespace) {
      return null;
    }

    if (!(namespace instanceof Namespace)) {
      this.props.logger.error("[NamespaceDetails]: passed object that is not an instanceof Namespace", namespace);

      return null;
    }

    const status = namespace.getStatus();

    return (
      <div className="NamespaceDetails">
        <DrawerItem name="Status">
          <span className={cssNames("status", status.toLowerCase())}>{status}</span>
        </DrawerItem>

        <DrawerItem name="Resource Quotas" className="quotas flex align-center">
          {!this.quotas && resourceQuotaStore.isLoading && <Spinner/>}
          {this.quotas.map(quota => quota.selfLink && (
            <Link key={quota.getId()} to={getDetailsUrl(quota.selfLink)}>
              {quota.getName()}
            </Link>
          ))}
        </DrawerItem>
        <DrawerItem name="Limit Ranges">
          {!this.limitranges && limitRangeStore.isLoading && <Spinner/>}
          {this.limitranges.map(limitrange => limitrange.selfLink && (
            <Link key={limitrange.getId()} to={getDetailsUrl(limitrange.selfLink)}>
              {limitrange.getName()}
            </Link>
          ))}
        </DrawerItem>

        {namespace.isControlledByHNC() && (
          <NamespaceTreeView tree={this.props.namespaceStore.getNamespaceTree(namespace)}/>
        )}
      </div>
    );
  }
}

export const NamespaceDetails = withInjectables<Dependencies, NamespaceDetailsProps>(NonInjectedNamespaceDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
    limitRangeStore: di.inject(limitRangeStoreInjectable),
    resourceQuotaStore: di.inject(resourceQuotaStoreInjectable),
    namespaceStore: di.inject(namespaceStoreInjectable),
    logger: di.inject(loggerInjectable),
  }),
});

