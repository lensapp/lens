import Call from "@hapi/call"
import Subtext from "@hapi/subtext"
import http from "http"
import path from "path"
import { readFile } from "fs-extra"
import { Cluster } from "./cluster"
import { helmApi } from "./helm-api"
import { resourceApplierApi } from "./resource-applier-api"
import { apiPrefix, appName, outDir } from "../common/vars";
import { configRoute, kubeconfigRoute, metricsRoute, portForwardRoute, watchRoute } from "./routes";

export interface RouterRequestOpts<P extends Record<string, string> = any> {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster;
  url: URL;
  params: P; // https://hapi.dev/module/call/api
}

export interface LensApiRequest<D = any, P = any> {
  path: string;
  payload: D;
  params: P;
  cluster: Cluster;
  response: http.ServerResponse;
  query: URLSearchParams;
  raw: {
    req: http.IncomingMessage;
  }
}

export class Router {
  protected router: any;

  public constructor() {
    this.router = new Call.Router();
    this.addRoutes()
  }

  public async route(cluster: Cluster, req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname
    const method = req.method.toLowerCase()
    const matchingRoute = this.router.route(method, path);
    const routeFound = !matchingRoute.isBoom;
    if (routeFound) {
      const request = await this.getRequest({
        req, res, cluster, url,
        params: matchingRoute.params
      });
      await matchingRoute.route(request)
      return true
    }
    return false;
  }

  protected async getRequest(opts: RouterRequestOpts) {
    const { req, res, url, cluster, params } = opts
    const { payload } = await Subtext.parse(req, null, { parse: true, output: 'data' });
    const request: LensApiRequest = {
      cluster: cluster,
      path: url.pathname,
      raw: {
        req: req,
      },
      response: res,
      query: url.searchParams,
      payload: payload,
      params: params
    }
    return request
  }

  protected getMimeType(filename: string) {
    const mimeTypes: Record<string, string> = {
      html: "text/html",
      txt: "text/plain",
      css: "text/css",
      gif: "image/gif",
      jpg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      js: "application/javascript",
      woff2: "font/woff2",
      ttf: "font/ttf"
    };
    return mimeTypes[path.extname(filename).slice(1)] || "text/plain"
  }

  protected async handleStaticFile(filePath: string, response: http.ServerResponse) {
    const asset = path.resolve(outDir, filePath);
    try {
      const data = await readFile(asset);
      response.setHeader("Content-Type", this.getMimeType(asset));
      response.write(data)
      response.end()
    } catch (err) {
      this.handleStaticFile(`${appName}.html`, response)
    }
  }

  protected addRoutes() {
    // Static assets
    this.router.add({ method: 'get', path: '/{path*}' }, (request: LensApiRequest) => {
      const { response, params } = request
      const file = params.path || "/index.html"
      this.handleStaticFile(file, response)
    })

    this.router.add({ method: "get", path: `${apiPrefix}/config` }, configRoute.routeConfig.bind(configRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/kubeconfig/service-account/{namespace}/{account}` }, kubeconfigRoute.routeServiceAccountRoute.bind(kubeconfigRoute))

    // Watch API
    this.router.add({ method: "get", path: `${apiPrefix}/watch` }, watchRoute.routeWatch.bind(watchRoute))

    // Metrics API
    this.router.add({ method: "post", path: `${apiPrefix}/metrics` }, metricsRoute.routeMetrics.bind(metricsRoute))

    // Port-forward API
    this.router.add({ method: "post", path: `${apiPrefix}/services/{namespace}/{service}/port-forward/{port}` }, portForwardRoute.routeServicePortForward.bind(portForwardRoute))

    // Helm API
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts` }, helmApi.listCharts.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts/{repo}/{chart}` }, helmApi.getChart.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts/{repo}/{chart}/values` }, helmApi.getChartValues.bind(helmApi))

    this.router.add({ method: "post", path: `${apiPrefix}/v2/releases` }, helmApi.installChart.bind(helmApi))
    this.router.add({ method: `put`, path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmApi.updateRelease.bind(helmApi))
    this.router.add({ method: `put`, path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback` }, helmApi.rollbackRelease.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace?}` }, helmApi.listReleases.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmApi.getRelease.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}/values` }, helmApi.getReleaseValues.bind(helmApi))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}/history` }, helmApi.getReleaseHistory.bind(helmApi))
    this.router.add({ method: "delete", path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmApi.deleteRelease.bind(helmApi))

    // Resource Applier API
    this.router.add({ method: "post", path: `${apiPrefix}/stack` }, resourceApplierApi.applyResource.bind(resourceApplierApi))
  }
}
