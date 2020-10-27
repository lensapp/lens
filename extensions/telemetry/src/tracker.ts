import { EventBus, Util } from "@k8slens/extensions"
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

  private constructor() {
    super();
    try {
      this.visitor = ua(Tracker.GA_ID, machineIdSync(), { strictCidFormat: false })
    } catch (error) {
      this.visitor = ua(Tracker.GA_ID)
    }
    this.visitor.set("dl", "https://telemetry.k8slens.dev")

  }

  start() {
    if (this.started === true) { return }

    this.started = true

    const handler = (ev: EventBus.AppEvent) => {
      this.event(ev.name, ev.action, ev.params)
    }
    this.eventHandlers.push(handler)
    EventBus.appEventBus.addListener(handler)
  }

  stop() {
    if (!this.started) { return }

    this.started = false

    for (const handler of this.eventHandlers) {
      EventBus.appEventBus.removeListener(handler)
    }
  }

  protected async isTelemetryAllowed(): Promise<boolean> {
    return telemetryPreferencesStore.enabled
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
