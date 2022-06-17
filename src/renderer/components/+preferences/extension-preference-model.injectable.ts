/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import currentPathParametersInjectable from "../../routes/current-path-parameters.injectable";
import { getExtensionPreferenceItems } from "./get-extension-preference-items";

export const extensionPreferencesModelInjectable = getInjectable({
  id: "extension-preferences-model",

  instantiate: (di) => {
    const pathParameters = di.inject(currentPathParametersInjectable);
    const extensions = di.inject(rendererExtensionsInjectable);
      
    return computed(() => {
      const { extensionId, tabId } = pathParameters.get();
      const targetExtension = extensions.get().find((extension) => extension.sanitizedExtensionId === extensionId);
      
      if (!targetExtension) {
        throw new Error("Tried to get extension preferences for extension that does not exist.");
      }
      
      return {
        extensionName: targetExtension.manifest.name,
        preferenceItems: getExtensionPreferenceItems(targetExtension, tabId),
      };
    });
  },
});
