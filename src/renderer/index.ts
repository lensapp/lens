/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import { getDi } from "./getDi";
import { bootstrap } from "./bootstrap";
import { 
  React, ReactDOM, ReactRouter, 
  ReactRouterDom, Mobx, MobxReact, LensExtensions,
} from "./extension-api";

const di = getDi();

// run
bootstrap(di);

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
