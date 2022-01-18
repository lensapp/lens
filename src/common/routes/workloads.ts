/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL, URLParams } from "../utils/buildUrl";
import type { KubeResource } from "../rbac";

// Routes
export const overviewRoute: RouteProps = {
  path: "/workloads",
};
export const podsRoute: RouteProps = {
  path: "/pods",
};
export const deploymentsRoute: RouteProps = {
  path: "/deployments",
};
export const daemonSetsRoute: RouteProps = {
  path: "/daemonsets",
};
export const statefulSetsRoute: RouteProps = {
  path: "/statefulsets",
};
export const replicaSetsRoute: RouteProps = {
  path: "/replicasets",
};
export const jobsRoute: RouteProps = {
  path: "/jobs",
};
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs",
};

export const workloadsRoute: RouteProps = {
  path: [
    overviewRoute,
    podsRoute,
    deploymentsRoute,
    daemonSetsRoute,
    statefulSetsRoute,
    replicaSetsRoute,
    jobsRoute,
    cronJobsRoute,
  ].map(route => route.path.toString()),
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

export interface ReplicaSetsRouteParams {
}

export interface JobsRouteParams {
}

export interface CronJobsRouteParams {
}

// URL-builders
export const workloadsURL = (params?: URLParams) => overviewURL(params);
export const overviewURL = buildURL<WorkloadsOverviewRouteParams>(overviewRoute.path);
export const podsURL = buildURL<PodsRouteParams>(podsRoute.path);
export const deploymentsURL = buildURL<DeploymentsRouteParams>(deploymentsRoute.path);
export const daemonSetsURL = buildURL<DaemonSetsRouteParams>(daemonSetsRoute.path);
export const statefulSetsURL = buildURL<StatefulSetsRouteParams>(statefulSetsRoute.path);
export const replicaSetsURL = buildURL<ReplicaSetsRouteParams>(replicaSetsRoute.path);
export const jobsURL = buildURL<JobsRouteParams>(jobsRoute.path);
export const cronJobsURL = buildURL<CronJobsRouteParams>(cronJobsRoute.path);

export const workloadURL: Partial<Record<KubeResource, ReturnType<typeof buildURL>>> = {
  "pods": podsURL,
  "deployments": deploymentsURL,
  "daemonsets": daemonSetsURL,
  "statefulsets": statefulSetsURL,
  "replicasets": replicaSetsURL,
  "jobs": jobsURL,
  "cronjobs": cronJobsURL,
};
