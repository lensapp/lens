// Server-side config
export const CLIENT_DIR = "client";
export const BUILD_DIR = "build";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const KUBERNETES_SERVICE_HOST = process.env.KUBERNETES_SERVICE_HOST || "kubernetes";
export const KUBERNETES_SERVICE_PORT = Number(process.env.KUBERNETES_SERVICE_PORT || 443);
export const KUBERNETES_SERVICE_URL = `https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}`;

export const config = {
  IS_PRODUCTION: IS_PRODUCTION,
  LENS_VERSION: process.env.LENS_VERSION,
  LENS_THEME: process.env.LENS_THEME,
  BUILD_VERSION: process.env.BUILD_VERSION,

  API_PREFIX: {
    BASE: '/api', // local express.js server api
    TERMINAL: '/api-terminal', // terminal api
    KUBE_BASE: '/api-kube', // kubernetes cluster api
    KUBE_USERS: '/api-users', // users & groups api
    KUBE_HELM: '/api-helm', // helm charts api middleware
    KUBE_RESOURCE_APPLIER: "/api-resource",
  },

  // express.js port
  LOCAL_SERVER_PORT: Number(process.env.LOCAL_SERVER_PORT || 8889),
  WEBPACK_DEV_SERVER_PORT: Number(process.env.LOCAL_SERVER_PORT || 8080),

  // session
  SESSION_NAME: process.env.SESSION_NAME || "lens-s3ss10n",
  SESSION_SECRET: process.env.SESSION_SECRET || "k0nt3n@-s3cr3t-key",

  // kubernetes apis
  KUBE_CLUSTER_NAME: process.env.KUBE_CLUSTER_NAME,
  KUBE_CLUSTER_URL: process.env.KUBE_CLUSTER_URL || KUBERNETES_SERVICE_URL,
  KUBE_USERS_URL: process.env.KUBE_USERS_URL || `http://localhost:9999`,
  KUBE_TERMINAL_URL: process.env.KUBE_TERMINAL_URL || `http://localhost:9998`,
  KUBE_HELM_URL: process.env.KUBE_HELM_URL || `http://localhost:9292`,
  KUBE_RESOURCE_APPLIER_URL: process.env.KUBE_RESOURCE_APPLIER_URL || `http://localhost:9393`,
  KUBE_METRICS_URL: process.env.KUBE_METRICS_URL || `http://localhost:9090`, // rbac-proxy-url

  // flags define visibility of some ui-parts and pages in dashboard
  USER_MANAGEMENT_ENABLED: JSON.parse(process.env.USER_MANAGEMENT_ENABLED || "false"),
  CHARTS_ENABLED: JSON.parse(process.env.CHARTS_ENABLED || "false"),

  // namespaces
  LENS_NAMESPACE: process.env.LENS_NAMESPACE || "kontena-lens",
  STATS_NAMESPACE: process.env.STATS_NAMESPACE || "kontena-stats",

  SERVICE_ACCOUNT_TOKEN: process.env.SERVICE_ACCOUNT_TOKEN
    || null,

  KUBERNETES_CA_CERT: process.env.KUBERNETES_CA_CERT,
  KUBERNETES_CLIENT_CERT: process.env.KUBERNETES_CLIENT_CERT || "",
  KUBERNETES_CLIENT_KEY: process.env.KUBERNETES_CLIENT_KEY || "",
  KUBERNETES_TLS_SKIP: JSON.parse(process.env.KUBERNETES_TLS_SKIP || "false"),
  KUBERNETES_NAMESPACE: process.env.KUBERNETES_NAMESPACE || "", // default allowed namespace
}

export function isSecure() {
  return IS_PRODUCTION ? !config.KUBERNETES_TLS_SKIP : false;
}

export default config;

// Client-side process.env, must be provided by webpack.DefinePlugin
export const clientVars = {
  BUILD_VERSION: config.BUILD_VERSION,
  IS_PRODUCTION: config.IS_PRODUCTION,
  API_PREFIX: config.API_PREFIX,
  LOCAL_SERVER_PORT: config.LOCAL_SERVER_PORT,
}

export type IClientVars = typeof clientVars;
