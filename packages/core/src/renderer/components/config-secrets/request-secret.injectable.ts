/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SecretStore } from "./store";
import secretStoreInjectable from "./store.injectable";

export type RequestSecret = SecretStore["load"];

const requestSecretInjectable = getInjectable({
  id: "request-secret",
  instantiate: (di): RequestSecret => {
    const secretStore = di.inject(secretStoreInjectable);

    return (ref) => secretStore.load(ref);
  },
});

export default requestSecretInjectable;
