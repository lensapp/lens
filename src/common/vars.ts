// App's common configuration for any process (main, renderer, build pipeline, etc.)
import path from "path";
import packageInfo from "../../package.json"
import { defineGlobal } from "./utils/defineGlobal";

export const isMac = process.platform === "darwin"
export const isWindows = process.platform === "win32"
export const isLinux = process.platform === "linux"
export const isDebugging = process.env.DEBUG === "true";
export const isSnap = !!process.env["SNAP"]
export const isProduction = process.env.NODE_ENV === "production"
export const isTestEnv = !!process.env.JEST_WORKER_ID;
export const isDevelopment = !isTestEnv && !isProduction;

export const appName = `${packageInfo.productName}${isDevelopment ? "Dev" : ""}`
export const publicPath = "/build/"

// Webpack build paths
export const contextDir = process.cwd();
export const buildDir = path.join(contextDir, "static", publicPath);
export const mainDir = path.join(contextDir, "src/main");
export const rendererDir = path.join(contextDir, "src/renderer");
export const htmlTemplate = path.resolve(rendererDir, "template.html");
export const sassCommonVars = path.resolve(rendererDir, "components/vars.scss");
export const webpackDevServerPort = 9009

// Special runtime paths
defineGlobal("__static", {
  get() {
    if (isDevelopment) {
      return path.resolve(contextDir, "static");
    }
    return path.resolve(process.resourcesPath, "static")
  }
})

// Apis
export const apiPrefix = "/api" // local router apis
export const apiKubePrefix = "/api-kube" // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues"
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI"
