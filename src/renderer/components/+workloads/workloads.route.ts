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
import { buildURL, IURLParams } from "../../../common/utils/buildUrl";
import { KubeResource } from "../../../common/rbac";

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
export const replicaSetsRoute: RouteProps = {
  path: "/replicasets"
};
export const jobsRoute: RouteProps = {
  path: "/jobs"
};
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs"
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
    cronJobsRoute
  ].map(route => route.path.toString())
};

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

export interface IReplicaSetsRouteParams {
}

export interface IJobsRouteParams {
}

export interface ICronJobsRouteParams {
}

// URL-builders
export const workloadsURL = (params?: IURLParams) => overviewURL(params);
export const overviewURL = buildURL<IWorkloadsOverviewRouteParams>(overviewRoute.path);
export const podsURL = buildURL<IPodsRouteParams>(podsRoute.path);
export const deploymentsURL = buildURL<IDeploymentsRouteParams>(deploymentsRoute.path);
export const daemonSetsURL = buildURL<IDaemonSetsRouteParams>(daemonSetsRoute.path);
export const statefulSetsURL = buildURL<IStatefulSetsRouteParams>(statefulSetsRoute.path);
export const replicaSetsURL = buildURL<IReplicaSetsRouteParams>(replicaSetsRoute.path);
export const jobsURL = buildURL<IJobsRouteParams>(jobsRoute.path);
export const cronJobsURL = buildURL<ICronJobsRouteParams>(cronJobsRoute.path);

export const workloadURL: Partial<Record<KubeResource, ReturnType<typeof buildURL>>> = {
  "pods": podsURL,
  "deployments": deploymentsURL,
  "daemonsets": daemonSetsURL,
  "statefulsets": statefulSetsURL,
  "replicasets": replicaSetsURL,
  "jobs": jobsURL,
  "cronjobs": cronJobsURL,
};
