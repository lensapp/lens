/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";
import React from "react";
import ReactDOM from "react-dom";
import setStatusBarStatusInjectable from "./components/status-bar/set-status-bar-status.injectable";

// @experimental
export { nodeEnvInjectionToken } from "../common/vars/node-env-injection-token";
export { registerLensCore } from "./register-lens-core";
export {
  React,
  ReactDOM,
  setStatusBarStatusInjectable,
};
export * as Mobx from "mobx";
export * as MobxReact from "mobx-react";
export * as ReactRouter from "react-router";
export * as ReactRouterDom from "react-router-dom";
export * as rendererExtensionApi from "../extensions/renderer-api";
export * as commonExtensionApi from "../extensions/common-api";
export { metricsFeature } from "../features/metrics/metrics-feature";
