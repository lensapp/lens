/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequireExactlyOne } from "type-fest";

/**
 * The react component props for {@link StatusBarComponents.Item}
 */
export interface StatusBarItemProps {}

/**
 * The components for a StatusBar registration
 */
export interface StatusBarComponents {
  /**
   * The actual component used for rendering within the status bar
   */
  Item?: React.ComponentType<StatusBarItemProps>;

  /**
   * The side of the bottom bar to place this component.
   *
   * @default "right"
   */
  position?: "left" | "right";
}

export type StatusBarRegistration = RequireExactlyOne<{
  /**
   * @deprecated use {@link StatusBarRegistration.components} instead as that is a component instead of a react node
   */
  item?: React.ReactNode;

  /**
   * The components for a registration
   */
  components?: StatusBarComponents;
}>;
