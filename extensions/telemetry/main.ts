import { LensMainExtension } from "@lens/extensions";
import { telemetryPreferencesStore } from "./src/telemetry-preferences-store"

export default class TelemetryMainExtension extends LensMainExtension {

  async onActivate() {
    console.log("telemetry main extension activated")
    await telemetryPreferencesStore.load()
  }

  onDeactivate() {
    console.log("telemetry main extension deactivated")
  }
}
