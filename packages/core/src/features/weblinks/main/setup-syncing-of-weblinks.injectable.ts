/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { onLoadOfApplicationInjectionToken } from "@k8slens/application";
import weblinkVerificationStartableStoppableInjectable from "./weblink-verification.injectable";
import catalogEntityRegistryInjectable from "../../../main/catalog/entity-registry.injectable";
import weblinkVerificationsInjectable from "./weblink-verifications.injectable";
import { computed } from "mobx";
import { iter } from "@k8slens/utilities";

const setupSyncingOfWeblinksInjectable = getInjectable({
  id: "setup-syncing-of-weblinks",

  instantiate: (di) => ({
    run: () => {
      const weblinkVerificationStartableStoppable = di.inject(weblinkVerificationStartableStoppableInjectable);
      const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);
      const weblinkVerifications = di.inject(weblinkVerificationsInjectable);

      weblinkVerificationStartableStoppable.start();
      catalogEntityRegistry.addComputedSource("weblinks", computed(() => (
        iter.chain(weblinkVerifications.values())
          .map(([weblink]) => weblink)
          .toArray()
      )));
    },
  }),

  injectionToken: onLoadOfApplicationInjectionToken,
});

export default setupSyncingOfWeblinksInjectable;
