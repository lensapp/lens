import React from "react";
import ReactDOM from "react-dom";
import "../common/system-ca"
import { Clusters } from "./components/+clusters";

async function render() {
  await Clusters.init();
  ReactDOM.render(<Clusters/>, document.getElementById("app"),)
}

window.addEventListener("load", render);
