import * as http from "http";
import { Cluster } from "./cluster";
import { helmApi } from "./helm-api"
import { resourceApplierApi } from "./resource-applier-api"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Call = require('@hapi/call');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Subtext = require('@hapi/subtext');

interface RouteParams {
  [key: string]: string | undefined;
}

export type LensApiRequest = {
  cluster: Cluster;
  payload: any;
  raw: {
    req: http.IncomingMessage;
  };
  params: RouteParams;
  response: http.ServerResponse;
  query: URLSearchParams;
  path: string;
}

export class Router {
  protected router: any

  public constructor() {
    this.router = new Call.Router();
    this.addRoutes()
  }

  public async route(cluster: Cluster, req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(req.url, "http://localhost")
    const path = url.pathname
    const method = req.method.toLowerCase()
    const matchingRoute = this.router.route(method, path)

    if (matchingRoute.isBoom !== true) { // route() returns error if route not found -> object.isBoom === true
      const request = await this.getRequest({ req, res, cluster, url, params: matchingRoute.params })
      await matchingRoute.route(request)
      return true
    } else {
      return false
    }
  }

  protected async getRequest(opts: { req: http.IncomingMessage; res: http.ServerResponse; cluster: Cluster; url: URL; params: RouteParams }) {
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

  protected addRoutes() {
    // Helm API
    this.router.add({ method: 'get', path: '/api-helm/v2/charts' }, helmApi.listCharts.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/charts/{repo}/{chart}' }, helmApi.getChart.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/charts/{repo}/{chart}/values' }, helmApi.getChartValues.bind(helmApi))

    this.router.add({ method: 'post', path: '/api-helm/v2/releases' }, helmApi.installChart.bind(helmApi))
    this.router.add({ method: 'put', path: '/api-helm/v2/releases/{namespace}/{release}' }, helmApi.updateRelease.bind(helmApi))
    this.router.add({ method: 'put', path: '/api-helm/v2/releases/{namespace}/{release}/rollback' }, helmApi.rollbackRelease.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/releases/{namespace?}' }, helmApi.listReleases.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/releases/{namespace}/{release}' }, helmApi.getRelease.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/releases/{namespace}/{release}/values' }, helmApi.getReleaseValues.bind(helmApi))
    this.router.add({ method: 'get', path: '/api-helm/v2/releases/{namespace}/{release}/history' }, helmApi.getReleaseHistory.bind(helmApi))
    this.router.add({ method: 'delete', path: '/api-helm/v2/releases/{namespace}/{release}' }, helmApi.deleteRelease.bind(helmApi))

    // Resource Applier API
    this.router.add({ method: 'post', path: '/api-resource/stack' }, resourceApplierApi.applyResource.bind(resourceApplierApi))
  }
}
