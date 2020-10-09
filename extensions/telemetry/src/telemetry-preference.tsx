import { Checkbox } from "@lens/ui-extensions"
import React from "react"
import { TelemetryPreferencesStore } from "./telemetry-preferences-store"

export class TelemetryPreferenceInput extends React.Component<{telemetry: TelemetryPreferencesStore}, {}> {
  render() {
    return (
      <Checkbox
        label="Allow telemetry & usage tracking"
        value={this.props.telemetry.enabled}
        onChange={v => this.props.telemetry.enabled = v}
      />
    )
  }
}

export class TelemetryPreferenceHint extends React.Component {
  render() {
    return (
      <span>Telemetry & usage data is collected to continuously improve the Lens experience.</span>
    )
  }
}
