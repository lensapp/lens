/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * The components for a top bar registration
 */
export interface TopBarComponents {
  /**
   * This is the main component of the registration
   */
  Item: React.ComponentType<{}>;
}

/**
 * The type used for registering new top bar items
 */
export interface TopBarRegistration {
  /**
   * The components for a registration
   */
  components: TopBarComponents;
}
