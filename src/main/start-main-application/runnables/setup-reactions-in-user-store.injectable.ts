/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";
import { onLoadOfApplicationInjectionToken } from "../runnable-tokens/on-load-of-application-injection-token";

const setupReactionsInUserStoreInjectable = getInjectable({
  id: "setup-reactions-in-user-store",

  instantiate: (di) => {
    const userStore = di.inject(userStoreInjectable);

    return {
      id: "setup-reactions-in-user-store",
      run: () => {
        userStore.startMainReactions();
      },
    };
  },

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupReactionsInUserStoreInjectable;
