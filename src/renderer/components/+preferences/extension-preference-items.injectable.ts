/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { filter, overSome } from "lodash/fp";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";

interface ExtensionPreferenceItem extends RegisteredAppPreference {
  extension: LensRendererExtension;
}

export const extensionPreferenceItemInjectionToken = getInjectionToken<ExtensionPreferenceItem>({
  id: "extension-preference-item-injection-token",
});

const extensionsPreferenceItemsInjectable = getInjectable({
  id: "extension-preference-items",

  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const enabledExtensions = extensions.get();

      return pipeline(
        di.injectMany(extensionPreferenceItemInjectionToken),

        filter((item) =>
          overSome([
            isNonExtensionItem,
            isEnabledExtensionItemFor(enabledExtensions),
          ])(item),
        ),
      );
    });
  },
});

const isNonExtensionItem = (item: ExtensionPreferenceItem) => !item.extension;

const isEnabledExtensionItemFor =
  (enabledExtensions: LensRendererExtension[]) => (item: ExtensionPreferenceItem) =>
    !!enabledExtensions.find((extension) => extension === item.extension);

export default extensionsPreferenceItemsInjectable;
