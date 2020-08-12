import { ipcRenderer, WebviewTag } from "electron";
import { observable, when } from "mobx";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { clusterIpc } from "../../../common/cluster-ipc";
import { clusterViewURL, getMatchedCluster, getMatchedClusterId } from "./cluster-view.route"
import { navigate } from "../../navigation";
import logger from "../../../main/logger";

export interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: WebviewTag
}

export const lensViews = observable.map<ClusterId, LensView>();

export async function navigateInClusterView(path: string, clusterId: ClusterId) {
  // select active cluster in common view
  if (clusterId !== getMatchedClusterId()) {
    clusterStore.setActive(clusterId);
    navigate(clusterViewURL({ params: { clusterId } }));
  }
  // navigate in cluster-view when ready
  await when(() => hasLoadedView(clusterId))
  ipcRenderer.sendTo(getViewId(clusterId), "menu:navigate", path);
}

export function hasLoadedView(clusterId: ClusterId): boolean {
  return !!lensViews.get(clusterId)?.isLoaded;
}

export function getViewId(clusterId: ClusterId): number {
  const webview = lensViews.get(clusterId)?.view
  if (webview) {
    return webview.getWebContentsId()
  }
}

// todo: figure out how to replace <webview>-tag to <iframe> with nodeIntegration=true
export function initView(clusterId: ClusterId) {
  if (!clusterId || lensViews.has(clusterId)) {
    return;
  }
  logger.info(`[CLUSTER-VIEW]: init dashboard, clusterId=${clusterId}`)
  const parentElem = document.getElementById("lens-views"); // defined in cluster-manager's css-grid
  const webview = document.createElement("webview");
  webview.setAttribute("src", `//${clusterId}.${location.host}`)
  webview.setAttribute("nodeintegration", "true")
  webview.setAttribute("enableremotemodule", "true")
  webview.addEventListener("did-finish-load", () => {
    logger.info(`[CLUSTER-VIEW]: loaded, clusterId=${clusterId}`)
    clusterIpc.init.invokeFromRenderer(clusterId); // push cluster-state to webview and init render
    lensViews.get(clusterId).isLoaded = true;
  });
  webview.addEventListener("did-fail-load", (event) => {
    logger.error(`[CLUSTER-VIEW]: failed to load, clusterId=${clusterId}`, event)
  });
  lensViews.set(clusterId, { clusterId, view: webview });
  parentElem.appendChild(webview); // add to dom and init cluster-page loading
}

export function refreshViews() {
  const cluster = getMatchedCluster();
  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isVisible = cluster && cluster.available && cluster.id === clusterId;
    view.style.display = isLoaded && isVisible ? "flex" : "none"
  })
}
