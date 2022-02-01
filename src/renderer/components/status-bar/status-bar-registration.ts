/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

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
  item?: React.ReactNode | (() => React.ReactNode);

  /**
   * The newer API, allows for registering a component instead of a ReactNode
   */
  components?: StatusBarComponents;
}
