import { Checkbox } from "@lens/ui-extensions"
import React from "react"
import { observer } from "mobx-react";
import { TelemetryPreferencesStore } from "./telemetry-preferences-store"

@observer
export class TelemetryPreferenceInput extends React.Component<{telemetry: TelemetryPreferencesStore}, {}> {
  render() {
    const { telemetry } = this.props
    return (
      <Checkbox
        label="Allow telemetry & usage tracking"
        value={telemetry.enabled}
        onChange={v => { telemetry.enabled = v; }}
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
