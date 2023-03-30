/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";

export const isDevelopment = process.env.NODE_ENV !== "production";
export const mainDir = path.join(process.cwd(), "src", "main");
export const buildDir = path.join(process.cwd(), "static", "build");
export const assetsFolderName = "assets";
export const rendererDir = path.join(process.cwd(), "src", "renderer");
export const publicPath = "/build/";

// TODO: Figure out a way to access these without relative paths
export const htmlTemplate = path.resolve(__dirname, "..", "..", "..", "node_modules", "@k8slens", "core", "src/renderer", "template.html");
export const sassCommonVars = path.resolve(__dirname, "..", "..", "..", "node_modules", "@k8slens", "core", "src", "renderer", "components/vars.scss");
