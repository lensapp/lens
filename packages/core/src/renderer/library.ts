/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import "./components/app.scss";
import React from "react";
import ReactDOM from "react-dom";

// @experimental
export { React, ReactDOM };
export * as Mobx from "mobx";
export * as MobxReact from "mobx-react";
export * as ReactRouter from "react-router";
export * as ReactRouterDom from "react-router-dom";
export * as extensionApi from "../extensions/renderer-api";
export { createApp } from "./create-app";
