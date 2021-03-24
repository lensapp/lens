import { observable, when } from "mobx";
import { ClusterId, ClusterStore, getClusterFrameUrl } from "../../../common/cluster-store";
import { getMatchedClusterId } from "../../navigation";
import logger from "../../../main/logger";
import AwaitLock from "await-lock";
import { Cluster } from "../../../main/cluster";

export interface LensView {
  isLoaded?: boolean
  clusterId: ClusterId;
  view: HTMLIFrameElement
}

export const lensViews = observable.map<ClusterId, LensView>();
const lensViewsLock = new AwaitLock();

export function hasLoadedView(clusterId: ClusterId): boolean {
  return !!lensViews.get(clusterId)?.isLoaded;
}

export async function initView(clusterId: ClusterId) {
  await lensViewsLock.acquireAsync();

  try {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    if (!cluster || lensViews.has(clusterId)) {
      return;
    }

    logger.info(`[LENS-VIEW]: init dashboard, clusterId=${clusterId}`);
    const iframe = createFrameFor(cluster);

    document
      .getElementById("lens-views")
      .appendChild(iframe);

    logger.info(`[LENS-VIEW]: waiting cluster to be ready, clusterId=${clusterId}`);
    cluster.whenReady
      .then(() => autoCleanOnRemove(clusterId, iframe));
  } finally {
    lensViewsLock.release();
  }
}

function createFrameFor(cluster: Cluster): HTMLIFrameElement {
  const iframe = document.createElement("iframe");

  iframe.name = cluster.contextName;
  iframe.setAttribute("src", getClusterFrameUrl(cluster.id));
  iframe.addEventListener("load", () => {
    logger.info(`[LENS-VIEW]: loaded from ${iframe.src}`);
    lensViews.get(cluster.id).isLoaded = true;
  }, {
    once: true
  });
  lensViews.set(cluster.id, { clusterId: cluster.id, view: iframe });

  return iframe;
}

export async function autoCleanOnRemove(clusterId: ClusterId, iframe: HTMLIFrameElement) {
  await when(() => {
    const cluster = ClusterStore.getInstance().getById(clusterId);

    return !cluster || (cluster.disconnected && lensViews.get(clusterId)?.isLoaded);
  });
  logger.info(`[LENS-VIEW]: remove dashboard, clusterId=${clusterId}`);
  lensViews.delete(clusterId);

  // Keep frame in DOM to avoid possible bugs when same cluster re-created after being removed.
  // In that case for some reasons `webFrame.routingId` returns some previous frameId (usage in app.tsx)
  // Issue: https://github.com/lensapp/lens/issues/811
  iframe.dataset.meta = `${iframe.name} was removed at ${new Date().toLocaleString()}`;
  iframe.removeAttribute("name");
  iframe.contentWindow.postMessage("teardown", "*");
}

export function refreshViews() {
  const cluster = ClusterStore.getInstance().getById(getMatchedClusterId());

  lensViews.forEach(({ clusterId, view, isLoaded }) => {
    const isCurrent = clusterId === cluster?.id;
    const isReady = cluster?.available && cluster?.ready;
    const isVisible = isCurrent && isLoaded && isReady;

    view.style.display = isVisible ? "flex" : "none";
  });
}
