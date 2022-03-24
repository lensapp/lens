/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type React from "react";
import { BaseRegistry } from "./base-registry";

export interface ContextProviderProps {
}

export interface ContextProviderComponents {
  Provider: React.ComponentType<ContextProviderProps>;
}

export interface ContextProviderRegistration {
  components: ContextProviderComponents;
}

export interface RegisteredContextProvider extends ContextProviderRegistration {
  id: string;
}

export class ContextProviderRegistry extends BaseRegistry<ContextProviderRegistration, RegisteredContextProvider> {
}
