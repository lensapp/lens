/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import type { ThemeId } from "../renderer/themes/lens-theme";

export const defaultThemeId: ThemeId = "lens-dark";
export const defaultFontSize = 12;
export const defaultTerminalFontFamily = "RobotoMono";
export const defaultEditorFontFamily = "RobotoMono";

// Apis
export const apiPrefix = "/api"; // local router apis
export const apiKubePrefix = "/api-kube"; // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const supportUrl = "https://docs.k8slens.dev/support/" as string;
export const docsUrl = "https://docs.k8slens.dev" as string;
export const forumsUrl = "https://forums.k8slens.dev" as string;
