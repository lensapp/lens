/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
