import type { RouteProps } from "react-router";
import { buildURL, IURLParams } from "../../../common/utils/buildUrl";
import { KubeResource } from "../../../common/rbac";
import { Workloads } from "./workloads";

export const workloadsRoute: RouteProps = {
  get path() {
    return Workloads.tabRoutes.map(({ path }) => path).flat()
  }
}

// Routes
export const overviewRoute: RouteProps = {
  path: "/workloads"
}
export const podsRoute: RouteProps = {
  path: "/pods"
}
export const deploymentsRoute: RouteProps = {
  path: "/deployments"
}
export const daemonSetsRoute: RouteProps = {
  path: "/daemonsets"
}
export const statefulSetsRoute: RouteProps = {
  path: "/statefulsets"
}
export const jobsRoute: RouteProps = {
  path: "/jobs"
}
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs"
}

// Route params
export interface IWorkloadsOverviewRouteParams {
}

export interface IPodsRouteParams {
}

export interface IDeploymentsRouteParams {
}

export interface IDaemonSetsRouteParams {
}

export interface IStatefulSetsRouteParams {
}

export interface IJobsRouteParams {
}

export interface ICronJobsRouteParams {
}

// URL-builders
export const workloadsURL = (params?: IURLParams) => overviewURL(params);
export const overviewURL = buildURL<IWorkloadsOverviewRouteParams>(overviewRoute.path)
export const podsURL = buildURL<IPodsRouteParams>(podsRoute.path)
export const deploymentsURL = buildURL<IDeploymentsRouteParams>(deploymentsRoute.path)
export const daemonSetsURL = buildURL<IDaemonSetsRouteParams>(daemonSetsRoute.path)
export const statefulSetsURL = buildURL<IStatefulSetsRouteParams>(statefulSetsRoute.path)
export const jobsURL = buildURL<IJobsRouteParams>(jobsRoute.path)
export const cronJobsURL = buildURL<ICronJobsRouteParams>(cronJobsRoute.path)

export const workloadURL: Partial<Record<KubeResource, ReturnType<typeof buildURL>>> = {
  "pods": podsURL,
  "deployments": deploymentsURL,
  "daemonsets": daemonSetsURL,
  "statefulsets": statefulSetsURL,
  "jobs": jobsURL,
  "cronjobs": cronJobsURL,
}
