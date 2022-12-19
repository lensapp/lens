/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import assert from "assert";
import path from "path";
import packageInfo from "../package.json";

export const isDevelopment = process.env.NODE_ENV !== "production";
export const mainDir = path.join(process.cwd(), "src", "main");
export const buildDir = path.join(process.cwd(), "static", "build");
export const extensionEntry = path.join(__dirname, "..", "src", "extensions", "extension-api.ts");
export const extensionOutDir = path.join(__dirname, "..", "src", "extensions", "npm", "extensions", "dist");
export const assetsFolderName = "assets";
export const rendererDir = path.join(process.cwd(), "src", "renderer");
export const appName = isDevelopment
  ? `${packageInfo.productName}Dev`
  : packageInfo.productName;
export const htmlTemplate = path.resolve(__dirname, "..", "src/renderer", "template.html");
export const publicPath = "/build/";
export const sassCommonVars = path.resolve(__dirname, "..", "src", "renderer", "components/vars.scss");
export const webpackDevServerPort = Number(process.env.WEBPACK_DEV_SERVER_PORT) || 9191;

assert(Number.isInteger(webpackDevServerPort), "WEBPACK_DEV_SERVER_PORT environment variable must only be an integer");