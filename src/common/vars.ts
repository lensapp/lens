// App's common configuration for any process (main, renderer, build pipeline, etc.)
import path from "path";

export const isMac = process.platform === "darwin"
export const isWindows = process.platform === "win32"
export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = !isProduction;
export const buildVersion = process.env.BUILD_VERSION;

// Paths
export const contextDir = process.cwd();
export const staticDir = path.join(contextDir, "static");
export const outDir = path.join(contextDir, "dist");
export const mainDir = path.join(contextDir, "src/main");
export const rendererDir = path.join(contextDir, "src/renderer");

// Apis
export const staticProto = "static://"

export const apiPrefix = {
  BASE: '/api',
  TERMINAL: '/api-terminal', // terminal api
  KUBE_BASE: '/api-kube', // kubernetes cluster api
  KUBE_USERS: '/api-users', // users & groups api
  KUBE_HELM: '/api-helm', // helm charts api
  KUBE_RESOURCE_APPLIER: "/api-resource",
};
