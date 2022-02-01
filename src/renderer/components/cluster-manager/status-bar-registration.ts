/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
interface StatusBarComponents {
  Item?: React.ComponentType;
  /**
   * The side of the bottom bar to place this component.
   *
   * @default "right"
   */
  position?: "left" | "right";
}

interface StatusBarRegistrationV2 {
  components?: StatusBarComponents; // has to be optional for backwards compatability
}

export interface StatusBarRegistration extends StatusBarRegistrationV2 {
  /**
   * @deprecated use components.Item instead
   */
  item?: React.ReactNode;
}
