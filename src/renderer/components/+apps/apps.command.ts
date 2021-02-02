import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { helmChartsURL } from "../+apps-helm-charts";
import { releaseURL } from "../+apps-releases";

commandRegistry.add({
  id: "cluster.viewHelmCharts",
  title: "Cluster: View Helm Charts",
  scope: "cluster",
  action: () => navigate(helmChartsURL())
});

commandRegistry.add({
  id: "cluster.viewHelmReleases",
  title: "Cluster: View Helm Releases",
  scope: "cluster",
  action: () => navigate(releaseURL())
});
