import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { configMapsURL } from "../+config-maps";
import { secretsURL } from "../+config-secrets";
import { resourceQuotaURL } from "../+config-resource-quotas";
import { limitRangeURL } from "../+config-limit-ranges";
import { hpaURL } from "../+config-autoscalers";
import { pdbURL } from "../+config-pod-disruption-budgets";

commandRegistry.add({
  id: "cluster.viewConfigMaps",
  title: "Cluster: View ConfigMaps",
  scope: "entity",
  action: () => navigate(configMapsURL())
});

commandRegistry.add({
  id: "cluster.viewSecrets",
  title: "Cluster: View Secrets",
  scope: "entity",
  action: () => navigate(secretsURL())
});

commandRegistry.add({
  id: "cluster.viewResourceQuotas",
  title: "Cluster: View ResourceQuotas",
  scope: "entity",
  action: () => navigate(resourceQuotaURL())
});

commandRegistry.add({
  id: "cluster.viewLimitRanges",
  title: "Cluster: View LimitRanges",
  scope: "entity",
  action: () => navigate(limitRangeURL())
});

commandRegistry.add({
  id: "cluster.viewHorizontalPodAutoscalers",
  title: "Cluster: View HorizontalPodAutoscalers (HPA)",
  scope: "entity",
  action: () => navigate(hpaURL())
});

commandRegistry.add({
  id: "cluster.viewPodDisruptionBudget",
  title: "Cluster: View PodDisruptionBudgets",
  scope: "entity",
  action: () => navigate(pdbURL())
});
