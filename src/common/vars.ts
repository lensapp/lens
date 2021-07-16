/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import path from "path";
import { SemVer } from "semver";
import packageInfo from "../../package.json";
import { defineGlobal } from "./utils/defineGlobal";

export const isMac = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isLinux = process.platform === "linux";
export const isDebugging = ["true", "1", "yes", "y", "on"].includes((process.env.DEBUG ?? "").toLowerCase());
export const isSnap = !!process.env.SNAP;
export const isProduction = process.env.NODE_ENV === "production";
export const isTestEnv = !!process.env.JEST_WORKER_ID;
export const isDevelopment = !isTestEnv && !isProduction;
export const isPublishConfigured = Object.keys(packageInfo.build).includes("publish");

export const integrationTestingArg = "--integration-testing";
export const isIntegrationTesting = process.argv.includes(integrationTestingArg);

export const productName = packageInfo.productName;
export const appName = `${packageInfo.productName}${isDevelopment ? "Dev" : ""}`;
export const publicPath = "/build/" as string;
export const defaultTheme = "lens-dark" as string;

// Webpack build paths
export const contextDir = process.cwd();
export const buildDir = path.join(contextDir, "static", publicPath);
export const preloadEntrypoint = path.join(contextDir, "src/preload.ts");
export const mainDir = path.join(contextDir, "src/main");
export const rendererDir = path.join(contextDir, "src/renderer");
export const htmlTemplate = path.resolve(rendererDir, "template.html");
export const sassCommonVars = path.resolve(rendererDir, "components/vars.scss");
export const webpackDevServerPort = 9009;

// Special runtime paths
defineGlobal("__static", {
  get() {
    const root = isDevelopment
      ? contextDir
      : (process.resourcesPath ?? contextDir);

    return path.resolve(root, "static");
  },
});

// Apis
export const apiPrefix = "/api" as string; // local router apis
export const apiKubePrefix = "/api-kube" as string; // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/zt-wcl8jq3k-68R5Wcmk1o95MLBE5igUDQ" as string;
export const supportUrl = "https://docs.k8slens.dev/latest/support/" as string;

export const appSemVer = new SemVer(packageInfo.version);
export const docsUrl = "https://docs.k8slens.dev/main/" as string;

export const sentryDsn = packageInfo.config?.sentryDsn ?? "";
