import { LensMainExtension } from "@lens/extensions";
import { TelemetryPreferencesStore } from "./src/telemetry-preferences-store"

export default class TelemetryMainExtension extends LensMainExtension {
  protected preferencesStore: TelemetryPreferencesStore

  async onActivate() {
    console.log("telemetry main extension activated")
    this.preferencesStore = TelemetryPreferencesStore.getInstance<TelemetryPreferencesStore>()
    await this.preferencesStore.load()
  }

  onDeactivate() {
    console.log("telemetry main extension deactivated")
  }
}
