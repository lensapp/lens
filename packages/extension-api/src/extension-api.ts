/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { extensionApi as main } from "@k8slens/core/main";
import { extensionApi as renderer } from "@k8slens/core/renderer";
import { extensionApi as common } from "@k8slens/core/common";

const Main = { ... main } as typeof main;
const Renderer = { ...renderer } as typeof renderer;
const Common = { ... common } as typeof common;

export {
  Main,
  Renderer,
  Common,
};
