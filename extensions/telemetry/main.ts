import { LensMainExtension } from "@k8slens/extensions";
import { telemetryPreferencesStore } from "./src/telemetry-preferences-store"
import { tracker } from "./src/tracker";

export default class TelemetryMainExtension extends LensMainExtension {

  async onActivate() {
    console.log("telemetry main extension activated")
    tracker.start()
    tracker.reportPeriodically()
    await telemetryPreferencesStore.loadExtension(this)
  }

  onDeactivate() {
    tracker.stop()
    console.log("telemetry main extension deactivated")
  }
}
