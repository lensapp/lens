import type { RouteProps } from "react-router";
import { buildURL, IURLParams } from "../../../common/utils/buildUrl";
import { isAllowedResource, KubeResource } from "../../../common/rbac";
import { Workloads } from "./workloads";
import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";

export const workloadsRoute: RouteProps = {
  get path() {
    return Workloads.tabRoutes.map(({ routePath }) => routePath).flat();
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
export const replicaSetsRoute: RouteProps = {
  path: "/replicasets"
};
export const jobsRoute: RouteProps = {
  path: "/jobs"
};
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs"
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

commandRegistry.add({
  id: "cluster.viewPods",
  title: "Cluster: View Pods",
  scope: "cluster",
  action: () => navigate(podsURL())
});

commandRegistry.add({
  id: "cluster.viewDeployments",
  title: "Cluster: View Deployments",
  scope: "cluster",
  action: () => navigate(deploymentsURL())
});

commandRegistry.add({
  id: "cluster.viewDaemonSets",
  title: "Cluster: View DaemonSets",
  scope: "cluster",
  action: () => navigate(daemonSetsURL())
});

commandRegistry.add({
  id: "cluster.viewStatefulSets",
  title: "Cluster: View StatefulSets",
  scope: "cluster",
  action: () => navigate(statefulSetsURL())
});
