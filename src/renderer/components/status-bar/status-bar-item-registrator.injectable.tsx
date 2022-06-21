/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { StatusBarItem } from "./status-bar-item-injection-token";
import { statusBarItemInjectionToken } from "./status-bar-item-injection-token";
import type { StatusBarRegistration } from "./status-bar-registration";
import React from "react";
import getRandomIdInjectable from "../../../common/utils/get-random-id.injectable";

const statusBarItemRegistratorInjectable = getInjectable({
  id: "status-bar-item-registrator",

  instantiate: (di) => (extension) => {
    const rendererExtension = extension as LensRendererExtension;
    const getRandomId = di.inject(getRandomIdInjectable);

    return rendererExtension.statusBarItems.flatMap(
      toItemInjectableFor(rendererExtension, getRandomId),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default statusBarItemRegistratorInjectable;

const toItemInjectableFor = (extension: LensRendererExtension, getRandomId: () => string) => {
  const _toItemInjectable = () => (registration: StatusBarRegistration): Injectable<StatusBarItem, StatusBarItem, void>[] => {
    const id = `${getRandomId()}-status-bar-item-for-extension-${extension.sanitizedExtensionId}`;
    let component: React.ComponentType;
    let position: "left" | "right";

    if (registration.item) {
      const { item } = registration;

      // default for old API is "right"
      component =
        () => (
          <>
            {
              typeof item === "function"
                ? item()
                : item
            }
          </>
        );
    } else if (registration.components) {
      const { position: pos = "right", Item } = registration.components;

      if (pos !== "left" && pos !== "right") {
        throw new TypeError("StatusBarRegistration.components.position must be either 'right' or 'left'");
      }

      position = pos;

      component = Item;
    } else {
      // throw?
    }

    return [getInjectable({
      id,

      instantiate: () => ({
        component,
        position,
        visible: computed(() => true),
      }),

      injectionToken: statusBarItemInjectionToken,
    })];

  };

  return _toItemInjectable();
};


