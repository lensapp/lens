/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import assert from "assert";
import path from "path";

export const isDevelopment = process.env.NODE_ENV !== "production";
export const mainDir = path.join(process.cwd(), "src", "main");
export const buildDir = path.join(process.cwd(), "static", "build");
export const assetsFolderName = "assets";
export const rendererDir = path.join(process.cwd(), "src", "renderer");
export const htmlTemplate = path.resolve(__dirname, "..", "node_modules", "@k8slens", "open-lens", "src/renderer", "template.html");
export const publicPath = "/build/";
export const sassCommonVars = path.resolve(__dirname, "..", "node_modules", "@k8slens", "open-lens", "src", "renderer", "components/vars.scss");
export const webpackDevServerPort = Number(process.env.WEBPACK_DEV_SERVER_PORT) || 9191;

assert(Number.isInteger(webpackDevServerPort), "WEBPACK_DEV_SERVER_PORT environment variable must only be an integer");
