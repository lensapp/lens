/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import extensionPreferencesRouteInjectable from "../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import { getExtensionPreferenceItems } from "./get-extension-preference-items";

export interface ExtensionPreferenceModel {
  preferenceItems: RegisteredAppPreference[];
  extensionName?: string;
  preferencePageTitle: string;
}

const extensionPreferencesModelInjectable = getInjectable({
  id: "extension-preferences-model",

  instantiate: (di): IComputedValue<ExtensionPreferenceModel | null> => {
    const route = di.inject(extensionPreferencesRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const params = pathParameters.get();

      if (!params) {
        return null;
      }

      const { extensionId, tabId } = params;
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
