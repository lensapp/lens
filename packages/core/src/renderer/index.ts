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
import { createApp } from "./create-app";

const di = getDi();
const app = createApp({
  di,
  mode: process.env.NODE_ENV || "development",
});

// run
app.start();

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
