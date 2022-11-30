/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { preferenceItemInjectionToken } from "../preference-items/preference-item-injection-token";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import { PreferencePageComponent } from "../preference-page-component";
import { ExtensionPreferenceBlock } from "./extension-preference-block";
import { computed } from "mobx";
import { HorizontalLine } from "../../../../renderer/components/horizontal-line/horizontal-line";

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

    const primaryPageId = `${commonId}-page`;
    const primaryPageInjectable = getInjectable({
      id: primaryPageId,

      instantiate: () => ({
        kind: "page" as const,
        id: primaryPageId,
        parentId: tabId,

        Component: ({ children }: { children: React.ReactElement }) => (
          <PreferencePageComponent
            id={primaryPageId}
            title={`${extension.name} preferences`}
          >
            {children}
          </PreferencePageComponent>
        ),

        childSeparator: () => <HorizontalLine />,
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

            Component: ({ children }: { children: React.ReactElement }) => (
              <PreferencePageComponent
                id={additionalPageId}
                title={registration.title}
              >
                {children}
              </PreferencePageComponent>
            ),
          }),

          injectionToken: preferenceItemInjectionToken,
        });
      },
    );

    const items = extension.appPreferences.map((registration, i) => {
      const itemId = `${commonId}-item-${registration.id ?? i}`;

      const itemIsInSpecialTab =
        registration.showInPreferencesTab &&
        ["telemetry", "application"].includes(
          registration.showInPreferencesTab,
        );

      return getInjectable({
        id: itemId,

        instantiate: () => ({
          kind: "block" as const,
          id: itemId,

          // Note: Legacy extensions considered telemetry and application as magic strings, and so does this code
          parentId: registration.showInPreferencesTab
            ? itemIsInSpecialTab
              ? `${registration.showInPreferencesTab}-page`
              : `${commonId}-additional-page-${registration.showInPreferencesTab}`
            : primaryPageId,

          orderNumber: i * 10 + (itemIsInSpecialTab ? 1000 : 0),

          Component: () => (
            <ExtensionPreferenceBlock registration={registration} />
          ),

          childSeparator: () => <HorizontalLine />,
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
