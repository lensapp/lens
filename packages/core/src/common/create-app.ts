/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInjection } from "@ogre-tools/injectable";

export interface ApplicationConfig {
  mode: string;
}

export interface Application {
  start: () => Promise<void>;
  readonly di: DiContainerForInjection;
}

export type CreateApplication = (config: ApplicationConfig) => Application;
