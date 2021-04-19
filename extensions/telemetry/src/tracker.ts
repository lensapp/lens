import { EventBus, Util, Catalog, App } from "@k8slens/extensions";
import ua from "universal-analytics";
import Analytics from "analytics-node";
import { machineIdSync } from "node-machine-id";
import { telemetryPreferencesStore } from "./telemetry-preferences-store";
import { reaction, IReactionDisposer } from "mobx";
import { comparer } from "mobx";

export class Tracker extends Util.Singleton {
  static readonly GA_ID = "UA-159377374-1";
  static readonly SEGMENT_KEY = "YENwswyhlOgz8P7EFKUtIZ2MfON7Yxqb";
  protected eventHandlers: Array<(ev: EventBus.AppEvent ) => void> = [];
  protected started = false;
  protected visitor: ua.Visitor;
  protected analytics: Analytics;
  protected machineId: string = null;
  protected ip: string = null;
  protected appVersion: string;
  protected locale: string;
  protected userAgent: string;
  protected anonymousId: string;
  protected os: string;
  protected disposers: IReactionDisposer[];

  protected reportInterval: NodeJS.Timeout;

  private constructor() {
    super();
    this.anonymousId = machineIdSync();
    this.os = this.resolveOS();
    this.userAgent = `Lens ${App.version} (${this.os})`;

    try {
      this.visitor = ua(Tracker.GA_ID, this.anonymousId, { strictCidFormat: false });
    } catch (error) {
      this.visitor = ua(Tracker.GA_ID);
    }

    this.analytics = new Analytics(Tracker.SEGMENT_KEY, { flushAt: 1 });
    this.visitor.set("dl", "https://telemetry.k8slens.dev");
    this.visitor.set("ua", this.userAgent);
    this.disposers = [];
  }

  start() {
    if (this.started === true) { return; }

    this.started = true;

    const handler = (ev: EventBus.AppEvent) => {
      this.event(ev.name, ev.action, ev.params);
    };

    this.eventHandlers.push(handler);
    EventBus.appEventBus.addListener(handler);
  }

  watchExtensions() {
    let previousExtensions = App.getEnabledExtensions();

    this.disposers.push(reaction(() => App.getEnabledExtensions(), (currentExtensions) => {
      const removedExtensions = previousExtensions.filter(x => !currentExtensions.includes(x));

      removedExtensions.forEach(ext => {
        this.event("extension", "disable", { extension: ext });
      });
      const newExtensions = currentExtensions.filter(x => !previousExtensions.includes(x));

      newExtensions.forEach(ext => {
        this.event("extension", "enable", { extension: ext });
      });
      previousExtensions = currentExtensions;
    }, { equals: comparer.structural }));
  }

  reportPeriodically() {
    this.reportData();
    this.reportInterval = setInterval(() => {
      this.reportData();
    }, 60 * 60 * 1000); // report every 1h
  }

  stop() {
    if (!this.started) { return; }

    this.started = false;

    for (const handler of this.eventHandlers) {
      EventBus.appEventBus.removeListener(handler);
    }

    if (this.reportInterval) {
      clearInterval(this.reportInterval);
    }
    this.disposers.forEach(disposer => {
      disposer();
    });
  }

  protected async isTelemetryAllowed(): Promise<boolean> {
    return telemetryPreferencesStore.enabled;
  }

  protected reportData() {
    const clustersList = Catalog.catalogEntities.getItemsForApiKind<Catalog.KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster");

    this.event("generic-data", "report", {
      appVersion: App.version,
      os: this.os,
      clustersCount: clustersList.length,
      extensions: App.getEnabledExtensions()
    });

    clustersList.forEach((cluster) => {
      if (!cluster?.metadata.lastSeen) { return; }
      this.reportClusterData(cluster);
    });
  }

  protected reportClusterData(cluster: Catalog.KubernetesCluster) {
    this.event("cluster-data", "report", {
      id: cluster.metadata.id,
      managed: cluster.metadata.source !== "local",
      kubernetesVersion: cluster.metadata.version,
      distribution: cluster.metadata.distribution,
      nodesCount: cluster.metadata.nodes,
      lastSeen: cluster.metadata.lastSeen,
      prometheus: cluster.metadata.prometheus
    });
  }

  protected resolveOS() {
    let os = "";

    if (App.isMac) {
      os = "MacOS";
    } else if(App.isWindows) {
      os = "Windows";
    } else if (App.isLinux) {
      os = "Linux";

      if (App.isSnap) {
        os += "; Snap";
      } else {
        os += "; AppImage";
      }
    } else {
      os = "Unknown";
    }

    return os;
  }

  protected async event(eventCategory: string, eventAction: string, otherParams = {}) {
    try {
      const allowed = await this.isTelemetryAllowed();

      if (!allowed) {
        return;
      }
      this.visitor.event({
        ec: eventCategory,
        ea: eventAction,
        ...otherParams,
      }).send();

      this.analytics.track({
        anonymousId: this.anonymousId,
        event: `${eventCategory} ${eventAction}`,
        context: {
          userAgent: this.userAgent,
        },
        properties: {
          category: eventCategory,
          ...otherParams,
        },

      });
    } catch (err) {
      console.error(`Failed to track "${eventCategory}:${eventAction}"`, err);
    }
  }
}

export const tracker = Tracker.getInstance<Tracker>();
