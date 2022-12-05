/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import type { ThemeId } from "../renderer/themes/lens-theme";

/**
 * @deprecated Switch to using isMacInjectable
 */
export const isMac = process.platform === "darwin";

/**
 * @deprecated Switch to using isWindowsInjectable
 */
export const isWindows = process.platform === "win32";

/**
 * @deprecated Switch to using isLinuxInjectable
 */
export const isLinux = process.platform === "linux";

/**
 * @deprecated switch to using `isDebuggingInjectable`
 */
export const isDebugging = ["true", "1", "yes", "y", "on"].includes((process.env.DEBUG ?? "").toLowerCase());

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
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/zt-wcl8jq3k-68R5Wcmk1o95MLBE5igUDQ" as string;
export const supportUrl = "https://docs.k8slens.dev/support/" as string;
export const docsUrl = "https://docs.k8slens.dev" as string;
