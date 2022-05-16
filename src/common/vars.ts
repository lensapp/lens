/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import path from "path";
import { SemVer } from "semver";
import packageInfo from "../../package.json";
import type { ThemeId } from "../renderer/themes/store";
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
export const defaultThemeId: ThemeId = "lens-dark";
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
export const staticFilesDirectory = path.resolve(
  !isProduction
    ? process.cwd()
    : process.resourcesPath,
  "static",
);

// Apis
export const apiPrefix = "/api"; // local router apis
export const apiKubePrefix = "/api-kube"; // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/zt-wcl8jq3k-68R5Wcmk1o95MLBE5igUDQ" as string;
export const supportUrl = "https://docs.k8slens.dev/latest/support/" as string;

export const lensWebsiteWeblinkId = "lens-website-link";
export const lensDocumentationWeblinkId = "lens-documentation-link";
export const lensSlackWeblinkId = "lens-slack-link";
export const lensTwitterWeblinkId = "lens-twitter-link";
export const lensBlogWeblinkId = "lens-blog-link";
export const kubernetesDocumentationWeblinkId = "kubernetes-documentation-link";

export const appSemVer = new SemVer(packageInfo.version);
export const docsUrl = "https://docs.k8slens.dev/main/" as string;

export const sentryDsn = packageInfo.config?.sentryDsn ?? "";
