/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isObject } from "@k8slens/utilities";
import { getInjectable } from "@ogre-tools/injectable";
import { enabledExtensionsMigrationDeclarationInjectionToken } from "./migrations";

const enabledExtensionsMigrationV650Injectable = getInjectable({
  id: "enabled-extensions-migration-v650",
  instantiate: () => ({
    version: "6.5.0",
    run: (store) => {
      const extensions = store.get("extensions");

      if (!isObject(extensions)) {
        store.delete("extensions");
      } else {
        store.set("extensions", Object.entries(extensions));
      }
    },
  }),
  injectionToken: enabledExtensionsMigrationDeclarationInjectionToken,
});

export default enabledExtensionsMigrationV650Injectable;
