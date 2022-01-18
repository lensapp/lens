/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export enum CatalogIpcEvents {
  /**
   * This is broadcast on whenever there is an update to any catalog item
   */
  ITEMS = "catalog:items",

  /**
   * This can be sent from renderer to main to initialize a broadcast of ITEMS
   */
  INIT = "catalog:init",
}
