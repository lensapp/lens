import { machineIdSync } from 'node-machine-id';
import { userStore } from "../common/user-store";
import * as ua from "universal-analytics";

const GA_ID = "UA-159377374-1";

export class Tracker {
  protected visitor: ua.Visitor
  protected machineId: string = null;
  protected ip: string = null;
  protected appVersion: string;
  protected locale: string;
  protected electronUA: string;

  constructor(_app: Electron.App) {
    try {
      this.visitor = ua(GA_ID, machineIdSync(), {strictCidFormat: false});
    } catch (error) {
      this.visitor = ua(GA_ID);
    }
    this.visitor.set("dl", "https://lensapptelemetry.lakendlabs.com");
  }

  public event(eventCategory: string, eventAction: string): void {
    if (!this.telemetryAllowed()) {
      return;
    }

    this.visitor
      .event({
        ec: eventCategory,
        ea: eventAction
      })
      .send();
  }

  protected telemetryAllowed(): boolean {
    return !!userStore.getPreferences().allowTelemetry;
  }
}
