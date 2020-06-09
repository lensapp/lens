// App's common paths/flags/etc. for any process
import packageInfo from "../package.json"
import path from "path";

const { main, renderer } = packageInfo.electronWebpack;

export const outDir = path.resolve(__dirname, "../dist");
export const mainDir = path.resolve(__dirname, "../", main.sourceDirectory);
export const rendererDir = path.resolve(__dirname, "../", renderer.sourceDirectory);

export const isMac = process.platform === "darwin"
export const isWindows = process.platform === "win32"
export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = !isProduction;
export const buildVersion = process.env.BUILD_VERSION;

export const apiPrefix = {
  BASE: '/api',
  TERMINAL: '/api-terminal', // terminal api
  KUBE_BASE: '/api-kube', // kubernetes cluster api
  KUBE_USERS: '/api-users', // users & groups api
  KUBE_HELM: '/api-helm', // helm charts api
  KUBE_RESOURCE_APPLIER: "/api-resource",
};
