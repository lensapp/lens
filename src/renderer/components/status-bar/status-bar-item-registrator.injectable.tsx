/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { flatMap } from "lodash/fp";
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { extensionRegistratorInjectionToken } from "../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import type { StatusBarItem } from "./status-bar-item-injection-token";
import { statusBarItemInjectionToken } from "./status-bar-item-injection-token";
import type { StatusBarRegistration } from "./status-bar-registration";
import * as uuid from "uuid";
import type React from "react";

const statusBarItemRegistratorInjectable = getInjectable({
  id: "status-bar-item-registrator",

  instantiate: (di) => (extension, installationCounter) => {
    const rendererExtension = extension as LensRendererExtension;

    pipeline(
      rendererExtension.statusBarItems,

      flatMap(toItemInjectablesFor(rendererExtension, installationCounter)),

      (injectables) => di.register(...injectables),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default statusBarItemRegistratorInjectable;

const toItemInjectablesFor = (extension: LensRendererExtension, installationCounter: number) => {
  const _toItemInjectables = () => (registration: StatusBarRegistration): Injectable<StatusBarItem, StatusBarItem, void>[] => {
    const id = `${uuid.v4()}-status-bar-item-for-extension-${extension.sanitizedExtensionId}-instance-${installationCounter}`;
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
      const { position: pos, Item } = registration.components;

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

  return _toItemInjectables();
};


