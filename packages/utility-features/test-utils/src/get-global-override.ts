/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable, Instantiate } from "@ogre-tools/injectable";

export interface GlobalOverride<Instance extends Token, Token, Param> {
  injectable: Injectable<Instance, Token, Param>;
  overridingInstantiate: Instantiate<Instance, Param>;
}

export const getGlobalOverride = <Instance extends Token, Token, Param>(
  injectable: Injectable<Instance, Token, Param>,
  overridingInstantiate: (typeof injectable)["instantiate"],
) => ({
    injectable,
    overridingInstantiate,
  });
