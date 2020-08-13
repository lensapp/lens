import ua from "universal-analytics"
import { machineIdSync } from "node-machine-id"
import { userStore } from "./user-store"

const GA_ID = "UA-159377374-1"

export class Tracker {
  protected visitor: ua.Visitor
  protected machineId: string = null;
  protected ip: string = null;
  protected appVersion: string;
  protected locale: string;
  protected electronUA: string;

  constructor(app: Electron.App) {
    try {
      this.visitor = ua(GA_ID, machineIdSync(), {strictCidFormat: false})
    } catch (error) {
      this.visitor = ua(GA_ID)
    }
    this.visitor.set("dl", "https://telemetry.k8slens.dev")
  }

  public async event(eventCategory: string, eventAction: string) {
    return new Promise(async (resolve, reject) => {
      if (!this.telemetryAllowed()) {
        resolve()
        return
      }
      this.visitor.event({
        ec: eventCategory,
        ea: eventAction
      }).send()
      resolve()
    })
  }

  protected telemetryAllowed() {
    const userPrefs = userStore.getPreferences()
    return !!userPrefs.allowTelemetry
  }
}
