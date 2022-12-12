/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import ReactDOM from "react-dom";
import * as Mobx from "mobx";
import * as MobxReact from "mobx-react";
import * as ReactRouter from "react-router";
import * as ReactRouterDom from "react-router-dom";
import * as LensExtensionsCommonApi from "../extensions/common-api";
import * as LensExtensionsRendererApi from "../extensions/renderer-api";

/**
 * Exports for virtual package "@k8slens/extensions" for renderer-process.
 * All exporting names available in global runtime scope:
 * e.g. Devtools -> Console -> window.LensExtensions (renderer)
 */
const LensExtensions = {
  Common: LensExtensionsCommonApi,
  Renderer: LensExtensionsRendererApi,
};

export {
  React,
  ReactDOM,
  ReactRouter,
  ReactRouterDom,
  Mobx,
  MobxReact,
  LensExtensions,
};
