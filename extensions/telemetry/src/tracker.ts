import { EventBus, Util, Store, App } from "@k8slens/extensions"
import ua from "universal-analytics"
import { machineIdSync } from "node-machine-id"
import { telemetryPreferencesStore } from "./telemetry-preferences-store"

export class Tracker extends Util.Singleton {
  static readonly GA_ID = "UA-159377374-1"

  protected eventHandlers: Array<(ev: EventBus.AppEvent ) => void> = []
  protected started = false
  protected visitor: ua.Visitor
  protected machineId: string = null;
  protected ip: string = null;
  protected appVersion: string;
  protected locale: string;
  protected electronUA: string;

  protected reportInterval: NodeJS.Timeout

  private constructor() {
    super();
    try {
      this.visitor = ua(Tracker.GA_ID, machineIdSync(), { strictCidFormat: false })
    } catch (error) {
      this.visitor = ua(Tracker.GA_ID)
    }
    this.visitor.set("dl", "https://telemetry.k8slens.dev")
    this.visitor.set("ua", `Lens ${App.version} (${this.getOS()})`)
  }

  start() {
    if (this.started === true) { return }

    this.started = true

    const handler = (ev: EventBus.AppEvent) => {
      this.event(ev.name, ev.action, ev.params)
    }
    this.eventHandlers.push(handler)
    EventBus.appEventBus.addListener(handler)

    this.reportInterval = setInterval(this.reportData, 60 * 60 * 1000) // report every 1h
  }

  stop() {
    if (!this.started) { return }

    this.started = false

    for (const handler of this.eventHandlers) {
      EventBus.appEventBus.removeListener(handler)
    }
    if (this.reportInterval) {
      clearInterval(this.reportInterval)
    }
  }

  protected async isTelemetryAllowed(): Promise<boolean> {
    return telemetryPreferencesStore.enabled
  }

  protected reportData() {
    const clustersList = Store.clusterStore.clustersList

    this.event("generic-data", "report", {
      appVersion: App.version,
      clustersCount: clustersList.length,
      workspacesCount: Store.workspaceStore.workspacesList.length
    })

    clustersList.forEach((cluster) => {
      if (!cluster?.metadata.lastSeen) { return }
      this.reportClusterData(cluster)
    })
  }

  protected reportClusterData(cluster: Store.ClusterModel) {
    this.event("cluster-data", "report", {
      id: cluster.metadata.id,
      kubernetesVersion: cluster.metadata.version,
      distribution: cluster.metadata.distribution,
      nodesCount: cluster.metadata.nodes,
      lastSeen: cluster.metadata.lastSeen
    })
  }

  protected getOS() {
    let os = ""
    if (App.isMac) {
      os = "MacOS"
    } else if(App.isWindows) {
      os = "Windows"
    } else if (App.isLinux) {
      os = "Linux"
      if (App.isSnap) {
        os += "; Snap"
      } else {
        os += "; AppImage"
      }
    } else {
      os = "Unknown"
    }
    return os
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
      }).send()
    } catch (err) {
      console.error(`Failed to track "${eventCategory}:${eventAction}"`, err)
    }
  }
}

export const tracker = Tracker.getInstance<Tracker>();
