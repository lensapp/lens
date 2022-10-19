/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { preferenceItemInjectionToken } from "../preference-items/preference-item-injection-token";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import { getPreferencePage } from "../get-preference-page";
import { ExtensionPreferenceItem } from "./extension-preference-item";
import { computed } from "mobx";

const registratorForPreferenceItemsInjectable = getInjectable({
  id: "registrator-for-preference-items",

  instantiate: () => (ext) => {
    const extension = ext as LensRendererExtension;

    const commonId = `preference-item-for-extension-${extension.sanitizedExtensionId}`;

    const tabId = `${commonId}-primary-tab`;
    const primaryTabInjectable = getInjectable({
      id: tabId,

      instantiate: () => ({
        kind: "tab" as const,
        id: tabId,
        parentId: "extensions-tab-group",
        pathId: extension.sanitizedExtensionId,
        label: extension.name,
        orderNumber: 10,
      }),

      injectionToken: preferenceItemInjectionToken,
    });

    const pageId = `${commonId}-page`;
    const primaryPageInjectable = getInjectable({
      id: pageId,

      instantiate: () => ({
        kind: "page" as const,
        id: pageId,
        parentId: tabId,
        orderNumber: 0,
        Component: getPreferencePage(`${extension.name} preferences`),
        childrenSeparator: () => <hr />,
      }),

      injectionToken: preferenceItemInjectionToken,
    });

    const additionalTabs = extension.appPreferenceTabs.map(
      (registration) => {
        const additionalTabId = `${commonId}-additional-tab-${registration.id}`;

        return getInjectable({
          id: additionalTabId,

          instantiate: () => ({
            kind: "tab" as const,
            id: additionalTabId,
            parentId: "general-tab-group",
            pathId: `extension-${extension.sanitizedExtensionId}-${registration.id}`,
            label: registration.title,
            isShown: computed(() => registration.visible?.get() ?? true),
            orderNumber: registration.orderNumber || 100,
          }),

          injectionToken: preferenceItemInjectionToken,
        });
      },
    );

    const additionalPages = extension.appPreferenceTabs.map(
      (registration) => {
        const additionalPageId = `${commonId}-additional-page-${registration.id}`;
        const additionalTabId = `${commonId}-additional-tab-${registration.id}`;

        return getInjectable({
          id: additionalPageId,

          instantiate: () => ({
            kind: "page" as const,
            id: additionalPageId,
            parentId: additionalTabId,
            Component: getPreferencePage(registration.title),
          }),

          injectionToken: preferenceItemInjectionToken,
        });
      },
    );

    const items = extension.appPreferences.map((registration, i) => {
      const itemId = `${commonId}-item-${registration.id ?? i}`;

      return getInjectable({
        id: itemId,

        instantiate: () => ({
          kind: "item" as const,
          id: itemId,

          // Note: Legacy extensions considered telemetry as magic string, and so does this code
          parentId: registration.showInPreferencesTab
            ? registration.showInPreferencesTab === "telemetry"
              ? "telemetry-page"
              : `${commonId}-additional-page-${registration.showInPreferencesTab}`
            : pageId,

          orderNumber: i * 10,

          Component: () => (
            <ExtensionPreferenceItem registration={registration} />
          ),

          childrenSeparator: () => <hr />,
        }),

        injectionToken: preferenceItemInjectionToken,
      });
    });

    return [
      primaryTabInjectable,
      ...additionalTabs,
      primaryPageInjectable,
      ...additionalPages,
      ...items,
    ];
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default registratorForPreferenceItemsInjectable;
