import { AppPreferenceRegistry, LensRendererExtension } from "@lens/ui-extensions";
import { TelemetryPreferencesStore } from "./src/telemetry-preferences-store"
import { TelemetryPreferenceHint, TelemetryPreferenceInput } from "./src/telemetry-preference"
import React from "react"

export default class TelemetryRendererExtension extends LensRendererExtension {
  protected preferencesStore: TelemetryPreferencesStore

  async onActivate() {
    console.log("telemetry extension activated")
    this.preferencesStore = TelemetryPreferencesStore.getInstance<TelemetryPreferencesStore>()
    await this.preferencesStore.load()
  }

  registerAppPreferences(registry: AppPreferenceRegistry) {
    this.disposers.push(
      registry.add({
        title: "Telemetry & Usage Tracking",
        components: {
          Hint: () => <TelemetryPreferenceHint />,
          Input: () => <TelemetryPreferenceInput telemetry={this.preferencesStore} />
        }
      })
    )
  }

  onDeactivate() {
    console.log("telemetry extension deactivated")
  }
}
