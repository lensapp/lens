/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import extensionPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import { getExtensionPreferenceItems } from "./get-extension-preference-items";

const extensionPreferencesModelInjectable = getInjectable({
  id: "extension-preferences-model",

  instantiate: (di) => {
    const route = di.inject(extensionPreferencesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable, route);
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const { extensionId, tabId } = pathParameters.get();
      const targetExtension = extensions.get().find((extension) => extension.sanitizedExtensionId === extensionId);
      const targetAppTab = targetExtension?.appPreferenceTabs.find(tab => tab.id === tabId);
      const preferencePageTitle = targetAppTab?.title || `${targetExtension?.manifest.name || "Extension"} preferences`;

      return {
        extensionName: targetExtension?.manifest.name,
        preferenceItems: getExtensionPreferenceItems(targetExtension, tabId),
        preferencePageTitle,
      };
    });
  },
});

export default extensionPreferencesModelInjectable;
