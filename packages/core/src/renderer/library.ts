/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";
import React from "react";
import ReactDOM from "react-dom";

// @experimental
export { createApp } from "./create-app";
export { applicationInformationToken } from "../common/vars/application-information-token";
export type { ApplicationInformation } from "../common/vars/application-information-token";
export { bundledExtensionInjectionToken } from "../extensions/extension-discovery/bundled-extension-token";

export { React, ReactDOM };
export * as Mobx from "mobx";
export * as MobxReact from "mobx-react";
export * as ReactRouter from "react-router";
export * as ReactRouterDom from "react-router-dom";
export * as extensionApi from "../extensions/renderer-api";
export * as commonExtensionApi from "../extensions/common-api";

