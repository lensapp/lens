import { RouteProps } from "react-router";
import { Workloads } from "./workloads";
import { buildURL, URLParams } from "../../navigation";

export const workloadsRoute: RouteProps = {
  get path() {
    return Workloads.tabRoutes.map(({ path }) => path).flat();
  }
};

// Routes
export const overviewRoute: RouteProps = {
  path: "/workloads"
};
export const podsRoute: RouteProps = {
  path: "/pods"
};
export const deploymentsRoute: RouteProps = {
  path: "/deployments"
};
export const daemonSetsRoute: RouteProps = {
  path: "/daemonsets"
};
export const statefulSetsRoute: RouteProps = {
  path: "/statefulsets"
};
export const jobsRoute: RouteProps = {
  path: "/jobs"
};
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs"
};

// Route params
export interface WorkloadsOverviewRouteParams {
}

export interface PodsRouteParams {
}

export interface DeploymentsRouteParams {
}

export interface DaemonSetsRouteParams {
}

export interface StatefulSetsRouteParams {
}

export interface JobsRouteParams {
}

export interface CronJobsRouteParams {
}

// URL-builders
export const overviewURL = buildURL<WorkloadsOverviewRouteParams>(overviewRoute.path);
export const workloadsURL = (params?: URLParams): string => overviewURL(params);
export const podsURL = buildURL<PodsRouteParams>(podsRoute.path);
export const deploymentsURL = buildURL<DeploymentsRouteParams>(deploymentsRoute.path);
export const daemonSetsURL = buildURL<DaemonSetsRouteParams>(daemonSetsRoute.path);
export const statefulSetsURL = buildURL<StatefulSetsRouteParams>(statefulSetsRoute.path);
export const jobsURL = buildURL<JobsRouteParams>(jobsRoute.path);
export const cronJobsURL = buildURL<CronJobsRouteParams>(cronJobsRoute.path);
