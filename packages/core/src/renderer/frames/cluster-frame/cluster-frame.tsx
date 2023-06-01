/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React, { useEffect } from "react";
import { Observer, observer } from "mobx-react";
import { ErrorBoundary } from "@k8slens/error-boundary";
import type { NamespaceStore } from "../../components/namespaces/store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable  from "../../components/namespaces/store.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import { disposer } from "@k8slens/utilities";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import type { ClusterFrameChildComponent } from "@k8slens/react-application";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";
import watchHistoryStateInjectable from "../../remote-helpers/watch-history-state.injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import type { IComputedValue } from "mobx";

interface Dependencies {
  namespaceStore: NamespaceStore;
  subscribeStores: SubscribeStores;
  childComponents: IComputedValue<ClusterFrameChildComponent[]>;
  watchHistoryState: () => () => void;
}

const NonInjectedClusterFrame = observer(({
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
      {childComponents.get()
        .map((child) => (
          <Observer key={child.id}>
            {() => (child.shouldRender.get() ? <child.Component /> : null) }
          </Observer>
        ))}
    </ErrorBoundary>
  );
});

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return {
      namespaceStore: di.inject(namespaceStoreInjectable),
      subscribeStores: di.inject(subscribeStoresInjectable),
      childComponents: computedInjectMany(clusterFrameChildComponentInjectionToken),
      watchHistoryState: di.inject(watchHistoryStateInjectable),
    };
  },
});

ClusterFrame.displayName = "ClusterFrame";
