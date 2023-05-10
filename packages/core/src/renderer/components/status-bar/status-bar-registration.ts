/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StrictReactNode } from "@k8slens/utilities";
import type { IComputedValue } from "mobx";

/**
 * The props for StatusBar item component
 */
export interface StatusBarItemProps {}

/**
 * The type defining the registration of a status bar item
 */
export interface StatusBarComponents {
  /**
   * The component for this registrations
   */
  Item: React.ComponentType<StatusBarItemProps>;

  /**
   * The side of the bottom bar to place this component.
   *
   * @default "right"
   */
  position?: "left" | "right";
}

/**
 * The type for registering status bar items from the LensRendererExtension
 */
export interface StatusBarRegistration {
  /**
   * @deprecated use {@link StatusBarRegistration.components} instead
   */
  item?: StrictReactNode | (() => StrictReactNode);

  /**
   * The newer API, allows for registering a component instead of a StrictReactNode
   */
  components?: StatusBarComponents;

  /**
   * If specified, controls item visibility
   */
  visible?: IComputedValue<boolean>;
}
