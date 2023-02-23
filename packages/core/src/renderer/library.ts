/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";
import React from "react";
import ReactDOM from "react-dom";

// @experimental

export { createApplication } from "./create-app";
export type { CreateApplication, Application, ApplicationConfig } from "../common/create-app";

export { React, ReactDOM };
export * as Mobx from "mobx";
export * as MobxReact from "mobx-react";
export * as ReactRouter from "react-router";
export * as ReactRouterDom from "react-router-dom";

// eslint-disable-next-line no-restricted-imports
export * as rendererExtensionApi from "../extensions/renderer-api";
// eslint-disable-next-line no-restricted-imports
export * as commonExtensionApi from "../extensions/common-api";
