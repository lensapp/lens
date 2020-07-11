// App's common configuration for any process (main, renderer, build pipeline, etc.)
import packageInfo from "../../package.json"
import path from "path";

export const isMac = process.platform === "darwin"
export const isWindows = process.platform === "win32"
export const isDebugging = process.env.DEBUG === "true";
export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = isDebugging || !isProduction;
export const isTestEnv = !!process.env.JEST_WORKER_ID;

export const appName = `${packageInfo.productName}${isDevelopment ? "Dev" : ""}`
export const appProto = "lens"  // app.getPath("userData") folder
export const staticProto = "static"  // static folder (e.g. "static://RELEASE_NOTES.md")

// System paths
export const contextDir = process.cwd();
export const staticDir = path.join(contextDir, "static");
export const outDir = path.join(contextDir, "out");
export const mainDir = path.join(contextDir, "src/main");
export const rendererDir = path.join(contextDir, "src/renderer");
export const htmlTemplate = path.resolve(rendererDir, "template.html");
export const sassCommonVars = path.resolve(rendererDir, "components/vars.scss");

// Apis
export const apiPrefix = "/api-local" // local router apis
export const apiKubePrefix = "/api-kube" // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues"
export const slackUrl = "https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI"
