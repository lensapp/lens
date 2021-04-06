import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { servicesURL } from "../+network-services";
import { endpointURL } from "../+network-endpoints";
import { ingressURL } from "../+network-ingresses";
import { networkPoliciesURL } from "../+network-policies";

commandRegistry.add({
  id: "cluster.viewServices",
  title: "Cluster: View Services",
  scope: "entity",
  action: () => navigate(servicesURL())
});

commandRegistry.add({
  id: "cluster.viewEndpoints",
  title: "Cluster: View Endpoints",
  scope: "entity",
  action: () => navigate(endpointURL())
});

commandRegistry.add({
  id: "cluster.viewIngresses",
  title: "Cluster: View Ingresses",
  scope: "entity",
  action: () => navigate(ingressURL())
});

commandRegistry.add({
  id: "cluster.viewNetworkPolicies",
  title: "Cluster: View NetworkPolicies",
  scope: "entity",
  action: () => navigate(networkPoliciesURL())
});
