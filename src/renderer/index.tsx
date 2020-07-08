import "../common/system-ca"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
// import { App } from "./components/app";

async function render() {
  await Promise.all([
    userStore.whenLoaded,
    workspaceStore.whenLoaded,
    clusterStore.whenLoaded,
  ]);

  // App.init();
  document.getElementById("app").innerHTML = "<p>Hello from renderer!</p>"
}

// run
render();
