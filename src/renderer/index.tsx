import React from "react";
import ReactDOM from "react-dom";
import "../common/system-ca"
import { userStore } from "../common/user-store";
import { workspaceStore } from "../common/workspace-store";
import { clusterStore } from "../common/cluster-store";
import { Workspaces } from "./components/+workspaces/workspaces";

async function render() {
  await Promise.all([
    userStore.load(),
    workspaceStore.load(),
    clusterStore.load(),
  ]);
  ReactDOM.render(<Workspaces/>, document.getElementById("app"),)
}

window.addEventListener("load", render);
