/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
export declare const getGlobalOverrideForFunction: (injectable: Injectable<Function, any, any>) => {
    injectable: Injectable<Function, unknown, any>;
    overridingInstantiate: import("@ogre-tools/injectable").Instantiate<Function, any>;
};
