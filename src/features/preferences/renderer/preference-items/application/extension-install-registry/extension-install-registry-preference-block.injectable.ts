/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../../preference-item-injection-token";
import { ExtensionInstallRegistry } from "./extension-install-registry";

const extensionInstallRegistryPreferenceBlockInjectable = getInjectable({
  id: "extension-install-registry-preference-item",

  instantiate: () => ({
    kind: "block" as const,
    id: "extension-install-registry",
    parentId: "application-page",
    orderNumber: 20,
    Component: ExtensionInstallRegistry,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default extensionInstallRegistryPreferenceBlockInjectable;
