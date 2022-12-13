/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./components/app.scss";

import { getDi } from "./getDi";
import { 
  React, ReactDOM, ReactRouter, 
  ReactRouterDom, Mobx, MobxReact, LensExtensions,
} from "./extension-api";
import { startApp } from "./start-app";

const di = getDi();

// run
startApp({
  di,
});

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
