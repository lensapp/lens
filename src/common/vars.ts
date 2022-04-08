/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import path from "path";
import { SemVer } from "semver";
import packageInfo from "../../package.json";
import { defineGlobal } from "./utils/defineGlobal";
import { lazyInitialized } from "./utils/lazy-initialized";

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
export const defaultFontSize = 12;
export const defaultTerminalFontFamily = "RobotoMono";
export const defaultEditorFontFamily = "RobotoMono";
export const normalizedPlatform = (() => {
  switch (process.platform) {
    case "darwin":
      return "darwin";
    case "linux":
      return "linux";
    case "win32":
      return "windows";
    default:
      throw new Error(`platform=${process.platform} is unsupported`);
  }
})();
export const normalizedArch = (() => {
  switch (process.arch) {
    case "arm64":
      return "arm64";
    case "x64":
    case "amd64":
      return "x64";
    case "386":
    case "x32":
    case "ia32":
      return "ia32";
    default:
      throw new Error(`arch=${process.arch} is unsupported`);
  }
})();

export function getBinaryName(name: string, { forPlatform = normalizedPlatform } = {}): string {
  if (forPlatform === "windows") {
    return `${name}.exe`;
  }

  return name;
}

const resourcesDir = lazyInitialized(() => (
  isProduction
    ? process.resourcesPath
    : path.join(process.cwd(), "binaries", "client", normalizedPlatform)
));

/**
 * @deprecated for being explicit side effect.
 */
export const baseBinariesDir = lazyInitialized(() => path.join(resourcesDir.get(), normalizedArch));

/**
 * @deprecated for being explicit side effect.
 */
export const kubeAuthProxyBinaryName = getBinaryName("lens-k8s-proxy");

/**
 * @deprecated for being explicit side effect.
 */
export const helmBinaryName = getBinaryName("helm");

/**
 * @deprecated for being explicit side effect.
 */
export const helmBinaryPath = lazyInitialized(() => path.join(baseBinariesDir.get(), helmBinaryName));

/**
 * @deprecated for being explicit side effect.
 */
export const kubectlBinaryName = getBinaryName("kubectl");

/**
 * @deprecated for being explicit side effect.
 */
export const kubectlBinaryPath = lazyInitialized(() => path.join(baseBinariesDir.get(), kubectlBinaryName));

// Webpack build paths
export const contextDir = process.cwd();
export const buildDir = path.join(contextDir, "static", publicPath);
export const preloadEntrypoint = path.join(contextDir, "src/preload.ts");
export const mainDir = path.join(contextDir, "src/main");
export const rendererDir = path.join(contextDir, "src/renderer");
export const htmlTemplate = path.resolve(rendererDir, "template.html");
export const sassCommonVars = path.resolve(rendererDir, "components/vars.scss");

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

export const webpackDevServerPort: number = Number(process.env.WEBPACK_DEV_SERVER_PORT) || 9191;
