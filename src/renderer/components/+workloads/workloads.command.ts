import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL } from "./workloads.route";

commandRegistry.add({
  id: "cluster.viewPods",
  title: "Cluster: View Pods",
  scope: "entity",
  action: () => navigate(podsURL())
});

commandRegistry.add({
  id: "cluster.viewDeployments",
  title: "Cluster: View Deployments",
  scope: "entity",
  action: () => navigate(deploymentsURL())
});

commandRegistry.add({
  id: "cluster.viewDaemonSets",
  title: "Cluster: View DaemonSets",
  scope: "entity",
  action: () => navigate(daemonSetsURL())
});

commandRegistry.add({
  id: "cluster.viewStatefulSets",
  title: "Cluster: View StatefulSets",
  scope: "entity",
  action: () => navigate(statefulSetsURL())
});

commandRegistry.add({
  id: "cluster.viewJobs",
  title: "Cluster: View Jobs",
  scope: "entity",
  action: () => navigate(jobsURL())
});

commandRegistry.add({
  id: "cluster.viewCronJobs",
  title: "Cluster: View CronJobs",
  scope: "entity",
  action: () => navigate(cronJobsURL())
});
