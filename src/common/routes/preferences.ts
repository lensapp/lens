/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils/buildUrl";

export const preferencesRoute: RouteProps = {
  path: "/preferences",
};

export const appRoute: RouteProps = {
  path: `${preferencesRoute.path}/app`,
};

export const proxyRoute: RouteProps = {
  path: `${preferencesRoute.path}/proxy`,
};

export const kubernetesRoute: RouteProps = {
  path: `${preferencesRoute.path}/kubernetes`,
};

export const editorRoute: RouteProps = {
  path: `${preferencesRoute.path}/editor`,
};

export const telemetryRoute: RouteProps = {
  path: `${preferencesRoute.path}/telemetry`,
};

export const extensionRoute: RouteProps = {
  path: `${preferencesRoute.path}/extensions`,
};

export const terminalRoute: RouteProps = {
  path: `${preferencesRoute.path}/terminal`,
};
export const preferencesURL = buildURL(preferencesRoute.path);
export const appURL = buildURL(appRoute.path);
export const proxyURL = buildURL(proxyRoute.path);
export const kubernetesURL = buildURL(kubernetesRoute.path);
export const editorURL = buildURL(editorRoute.path);
export const telemetryURL = buildURL(telemetryRoute.path);
export const extensionURL = buildURL(extensionRoute.path);
export const terminalURL = buildURL(terminalRoute.path);
