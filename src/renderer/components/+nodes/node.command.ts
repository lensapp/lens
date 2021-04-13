import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { nodesURL } from "./nodes.route";

commandRegistry.add({
  id: "cluster.viewNodes",
  title: "Cluster: View Nodes",
  scope: "entity",
  action: () => navigate(nodesURL())
});
