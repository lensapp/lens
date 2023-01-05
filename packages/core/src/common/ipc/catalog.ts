/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This is used to activate a specific entity in the renderer main frame
 */
export const catalogEntityRunListener = "catalog-entity:run";

/**
 * This is broadcast on whenever there is an update to any catalog item
 */
export const catalogItemsChannel = "catalog:items";

/**
 * This can be sent from renderer to main to initialize a broadcast of ITEMS
 */
export const catalogInitChannel = "catalog:init";
