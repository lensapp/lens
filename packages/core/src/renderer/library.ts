/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";
import React from "react";
import ReactDOM from "react-dom";

// @experimental
export type {
  Environments,
} from "../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

export { nodeEnvInjectionToken } from "../common/vars/node-env-injection-token";
export { registerLensCore } from "./register-lens-core";
export { React, ReactDOM };
export * as Mobx from "mobx";
export * as MobxReact from "mobx-react";
export * as ReactRouter from "react-router";
export * as ReactRouterDom from "react-router-dom";
export * as rendererExtensionApi from "../extensions/renderer-api";
export * as commonExtensionApi from "../extensions/common-api";
