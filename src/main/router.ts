import Call from "@hapi/call"
import Subtext from "@hapi/subtext"
import http from "http"
import path from "path"
import { readFile } from "fs-extra"
import { Cluster } from "./cluster"
import { apiPrefix, appName, publicPath, isDevelopment, webpackDevServerPort } from "../common/vars";
import { helmRoute, kubeconfigRoute, metricsRoute, portForwardRoute, resourceApplierRoute, watchRoute } from "./routes";

export interface RouterRequestOpts {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  cluster: Cluster;
  params: RouteParams;
  url: URL;
}

export interface RouteParams extends Record<string, string> {
  path?: string; // *-route
  namespace?: string;
  service?: string;
  account?: string;
  release?: string;
  repo?: string;
  chart?: string;
}

export interface LensApiRequest<P = any> {
  path: string;
  payload: P;
  params: RouteParams;
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
      const request = await this.getRequest({ req, res, cluster, url, params: matchingRoute.params });
      await matchingRoute.route(request)
      return true
    }
    return false;
  }

  protected async getRequest(opts: RouterRequestOpts): Promise<LensApiRequest> {
    const { req, res, url, cluster, params } = opts
    const { payload } = await Subtext.parse(req, null, {
      parse: true,
      output: "data",
    });
    return {
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

  async handleStaticFile(filePath: string, res: http.ServerResponse, req: http.IncomingMessage) {
    const asset = path.join(__static, filePath);
    try {
      const filename = path.basename(req.url);
      // redirect requests to [appName].js, [appName].html /sockjs-node/ to webpack-dev-server (for hot-reload support)
      const toWebpackDevServer = filename.includes(appName) || filename.includes('hot-update') || req.url.includes('sockjs-node');
      if (isDevelopment && toWebpackDevServer) {
        const redirectLocation = `http://localhost:${webpackDevServerPort}` + req.url;
        res.statusCode = 307;
        res.setHeader('Location', redirectLocation);
        res.end();
        return;
      }
      const data = await readFile(asset);
      res.setHeader("Content-Type", this.getMimeType(asset));
      res.write(data);
      res.end();
    } catch (err) {
      this.handleStaticFile(`${publicPath}/${appName}.html`, res, req);
    }
  }

  protected addRoutes() {
    // Static assets
    this.router.add(
      { method: 'get', path: '/{path*}' },
      ({ params, response, path, raw: { req }}: LensApiRequest) => {
        this.handleStaticFile(params.path, response, req);
      });

    this.router.add({ method: "get", path: `${apiPrefix}/kubeconfig/service-account/{namespace}/{account}` }, kubeconfigRoute.routeServiceAccountRoute.bind(kubeconfigRoute))

    // Watch API
    this.router.add({ method: "get", path: `${apiPrefix}/watch` }, watchRoute.routeWatch.bind(watchRoute))

    // Metrics API
    this.router.add({ method: "post", path: `${apiPrefix}/metrics` }, metricsRoute.routeMetrics.bind(metricsRoute))

    // Port-forward API
    this.router.add({ method: "post", path: `${apiPrefix}/pods/{namespace}/{resourceType}/{resourceName}/port-forward/{port}` }, portForwardRoute.routePortForward.bind(portForwardRoute))

    // Helm API
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts` }, helmRoute.listCharts.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts/{repo}/{chart}` }, helmRoute.getChart.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/charts/{repo}/{chart}/values` }, helmRoute.getChartValues.bind(helmRoute))

    this.router.add({ method: "post", path: `${apiPrefix}/v2/releases` }, helmRoute.installChart.bind(helmRoute))
    this.router.add({ method: `put`, path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmRoute.updateRelease.bind(helmRoute))
    this.router.add({ method: `put`, path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback` }, helmRoute.rollbackRelease.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace?}` }, helmRoute.listReleases.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmRoute.getRelease.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}/values` }, helmRoute.getReleaseValues.bind(helmRoute))
    this.router.add({ method: "get", path: `${apiPrefix}/v2/releases/{namespace}/{release}/history` }, helmRoute.getReleaseHistory.bind(helmRoute))
    this.router.add({ method: "delete", path: `${apiPrefix}/v2/releases/{namespace}/{release}` }, helmRoute.deleteRelease.bind(helmRoute))

    // Resource Applier API
    this.router.add({ method: "post", path: `${apiPrefix}/stack` }, resourceApplierRoute.applyResource.bind(resourceApplierRoute))
  }
}
