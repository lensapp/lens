import { observable } from "mobx";
import { ClusterId, clusterStore } from "../../../common/cluster-store";
import { getMatchedCluster } from "./cluster-view.route"
import logger from "../../../main/logger";

export interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: HTMLIFrameElement
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
  const cluster = clusterStore.getById(clusterId);
  await cluster.whenInitialized;
  const parentElem = document.getElementById("lens-views");
  const iframe = document.createElement("iframe");
  iframe.name = cluster.preferences.clusterName;
  iframe.setAttribute("src", `//${clusterId}.${location.host}`)
  iframe.addEventListener("load", async () => {
    logger.info(`[LENS-VIEW]: loaded from ${iframe.src}`)
    lensViews.get(clusterId).isLoaded = true;
  })
  lensViews.set(clusterId, { clusterId, view: iframe });
  parentElem.appendChild(iframe);
}

export function refreshViews() {
  const cluster = getMatchedCluster();
  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isVisible = cluster && cluster.available && cluster.id === clusterId;
    view.style.display = isLoaded && isVisible ? "flex" : "none"
  })
}
