/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SubscribableStore } from "../kube-watch-api/kube-watch-api";
import type { Disposer } from "../utils";
import subscribeStoresInjectable from "./subscribe-stores.injectable";

const subscribeToStoresDisposersInjectable = getInjectable({
  id: "subscribe-to-stores-disposers",
  causesSideEffects: true,
  instantiate: (di) => {
    const subscribe = di.inject(subscribeStoresInjectable);

    return (stores: SubscribableStore[]) => {
      const disposer: Disposer = subscribe(stores, {
        onLoadFailure: error => {
          console.warn("Failed to load store: ", error);
          // TODO: Show notification
        },
      })

      return () => disposer();
    }
  }
});
 
export default subscribeToStoresDisposersInjectable;
