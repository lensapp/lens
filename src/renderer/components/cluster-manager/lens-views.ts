import { WebviewTag } from "electron";
import { observable, when } from "mobx";
import { ClusterId, clusterStore, getClusterViewUrl } from "../../../common/cluster-store";
import logger from "../../../main/logger";
import { getMatchedCluster } from "./cluster-view.route";

export interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: WebviewTag;
}

export const lensViews = observable.map<ClusterId, LensView>();

export function hasLoadedView(clusterId: ClusterId): boolean {
  return !!lensViews.get(clusterId)?.isLoaded;
}

export async function initView(clusterId: ClusterId) {
  if (!clusterId || lensViews.has(clusterId)) {
    return;
  }
  logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`)
  const parentElem = document.getElementById("lens-views");
  const onLoad = () => {
    logger.info(`[LENS-VIEW]: loaded from ${view.src}`)
    lensViews.get(clusterId).isLoaded = true;
  };
  const view = document.createElement("webview");
  view.addEventListener("did-frame-finish-load", onLoad);
  view.setAttribute("nodeintegration", "true");
  view.setAttribute("enableremotemodule", "true");
  view.setAttribute("src", getClusterViewUrl(clusterId));
  parentElem.appendChild(view);
  lensViews.set(clusterId, { clusterId, view });
  await autoCleanOnRemove(clusterId, view);
}

export async function autoCleanOnRemove(clusterId: ClusterId, view: WebviewTag) {
  await when(() => !clusterStore.getById(clusterId));
  logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`)
  lensViews.delete(clusterId);
  view.parentElement.removeChild(view);
}

export function refreshViews() {
  const cluster = getMatchedCluster();
  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isCurrent = clusterId === cluster?.id;
    const isReady = cluster?.available && cluster?.ready;
    const isVisible = isCurrent && isLoaded && isReady;
    view.style.display = isVisible ? "flex" : "none"
  })
}
