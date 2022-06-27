/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useEffect } from "react";
import { Observer, observer } from "mobx-react";
import { ErrorBoundary } from "../../components/error-boundary";
import type { NamespaceStore } from "../../components/+namespaces/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable  from "../../components/+namespaces/store.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import { disposer } from "../../utils";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { ClusterFrameChildComponent } from "./cluster-frame-child-component-injection-token";
import { clusterFrameChildComponentInjectionToken } from "./cluster-frame-child-component-injection-token";
import watchHistoryStateInjectable from "../../remote-helpers/watch-history-state.injectable";

interface Dependencies {
  namespaceStore: NamespaceStore;
  subscribeStores: SubscribeStores;
  childComponents: ClusterFrameChildComponent[];
  watchHistoryState: () => () => void;
}

export const NonInjectedClusterFrame = observer(({
  namespaceStore,
  subscribeStores,
  childComponents,
  watchHistoryState,
}: Dependencies) => {
  useEffect(() => disposer(
    subscribeStores([
      namespaceStore,
    ]),
    watchHistoryState(),
  ), []);

  return (
    <ErrorBoundary>
      {childComponents
        .map((child) => (
          <Observer key={child.id}>
            {() => (child.shouldRender.get() ? <child.Component /> : null) }
          </Observer>
        ))}
    </ErrorBoundary>
  );
});

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    childComponents: di.injectMany(clusterFrameChildComponentInjectionToken),
    watchHistoryState: di.inject(watchHistoryStateInjectable),
  }),
});

ClusterFrame.displayName = "ClusterFrame";
