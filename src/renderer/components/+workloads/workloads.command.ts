import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL } from "./workloads.route";

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

commandRegistry.add({
  id: "cluster.viewJobs",
  title: "Cluster: View Jobs",
  scope: "cluster",
  action: () => navigate(jobsURL())
});

commandRegistry.add({
  id: "cluster.viewCronJobs",
  title: "Cluster: View CronJobs",
  scope: "cluster",
  action: () => navigate(cronJobsURL())
});
