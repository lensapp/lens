/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed, onBecomeObserved, onBecomeUnobserved } from "mobx";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import secretStoreInjectable from "../config-secrets/store.injectable";

const releaseSecretsInjectable = getInjectable({
  id: "release-secrets",

  instantiate: (di) => {
    const subscribeStores = di.inject(subscribeStoresInjectable);
    const secretStore = di.inject(secretStoreInjectable);

    const releaseSecrets = computed(() =>
      secretStore.contextItems.filter((secret) =>
        secret.type.startsWith("helm.sh/release"),
      ),
    );

    let unsubscribe: () => void;

    onBecomeObserved(releaseSecrets, () => {
      unsubscribe = subscribeStores([secretStore]);
    });

    onBecomeUnobserved(releaseSecrets, () => {
      unsubscribe?.();
    });

    return releaseSecrets;
  },
});

export default releaseSecretsInjectable;
