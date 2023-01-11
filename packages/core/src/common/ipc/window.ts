/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export const windowActionHandleChannel = "window:window-action";
export const windowOpenAppMenuAsContextMenuChannel = "window:open-app-context-menu";
export const windowLocationChangedChannel = "window:location-changed";

/**
 * The supported actions on the current window. The argument for `windowActionHandleChannel`
 */
export enum WindowAction {
  /**
   * Request that the current window goes back one step of browser history
   */
  GO_BACK = "back",

  /**
   * Request that the current window goes forward one step of browser history
   */
  GO_FORWARD = "forward",

  /**
   * Request that the current window is minimized
   */
  MINIMIZE = "minimize",

  /**
   * Request that the current window is maximized if it isn't, or unmaximized
   * if it is
   */
  TOGGLE_MAXIMIZE = "toggle-maximize",

  /**
   * Request that the current window is closed
   */
  CLOSE = "close",
}
