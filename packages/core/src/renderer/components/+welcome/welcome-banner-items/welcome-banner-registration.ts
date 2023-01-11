/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * WelcomeBannerRegistration is for an extension to register
 * Provide a Banner component to be renderered in the welcome screen.
 */
export interface WelcomeBannerRegistration {
  /**
   * The banner component to be shown on the welcome screen.
   */
  Banner: React.ComponentType;
  /**
   * The banner width in px.
   */
  width?: number;
}
