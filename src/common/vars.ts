/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import type { ThemeId } from "../renderer/themes/lens-theme";

/**
 * @deprecated Switch to using isTestEnvInjectable
 */
export const isTestEnv = !!process.env.JEST_WORKER_ID;

/**
 * @deprecated Switch to using isProductionInjectable
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * @deprecated Switch to using isDevelopmentInjectable
 */
export const isDevelopment = !isTestEnv && !isProduction;

export const publicPath = "/build/" as string;
export const defaultThemeId: ThemeId = "lens-dark";
export const defaultFontSize = 12;
export const defaultTerminalFontFamily = "RobotoMono";
export const defaultEditorFontFamily = "RobotoMono";

// Apis
export const apiPrefix = "/api"; // local router apis
export const apiKubePrefix = "/api-kube"; // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const slackUrl = "https://k8slens.dev/slack.html" as string;
export const supportUrl = "https://docs.k8slens.dev/support/" as string;
export const docsUrl = "https://docs.k8slens.dev" as string;
