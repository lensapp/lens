import "./preferences.scss"
import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { t, Trans } from "@lingui/macro";
import { _i18n } from "../../i18n";
import { WizardLayout } from "../layout/wizard-layout";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { ThemeType, userStore } from "../../../common/user-store";
import { Input } from "../input";
import { Checkbox } from "../checkbox";

type ThemeSelectOption = SelectOption & { type: ThemeType }

@observer
export class Preferences extends React.Component {
  themeOptions: ThemeSelectOption[] = [
    { value: "kontena-dark", label: <Trans>Dark</Trans>, type: ThemeType.DARK },
    { value: "kontena-light", label: <Trans>Light</Trans>, type: ThemeType.LIGHT },
  ]

  downloadMirrorOptions: SelectOption[] = [
    { value: "default", label: "Default (Google)" },
    { value: "china", label: "China (Azure)" },
  ]

  onThemeChange = ({ value }: ThemeSelectOption) => {
    // themeStore.setTheme(value); // fixme: apply theme on the fly for current view
    userStore.preferences.colorTheme = value;
  }

  renderInfo() {
    return (
      <Fragment>
        <h2>
          <Trans>Preferences</Trans>
        </h2>
        <div className="info-block flex gaps align-center">
          <Icon small material="info"/>
          <small>
            <Trans>Lens Global Settings</Trans> (<Trans>applicable to all clusters</Trans>)
          </small>
        </div>
      </Fragment>
    )
  }

  render() {
    const { preferences } = userStore;
    return (
      <WizardLayout className="Preferences" infoPanel={this.renderInfo()}>
        <h2><Trans>Color Theme</Trans></h2>
        <Select
          options={this.themeOptions}
          value={preferences.colorTheme}
          onChange={this.onThemeChange}
        />

        <h2><Trans>Download Mirror</Trans></h2>
        <Select
          placeholder={_i18n._(t`Download mirror for kubectl`)}
          options={this.downloadMirrorOptions}
          value={preferences.downloadMirror}
          onChange={({ value }: SelectOption) => preferences.downloadMirror = value}
        />

        <h2><Trans>Helm</Trans></h2>
        <div className="helm">
          // todo: added helm repos
        </div>

        <h2><Trans>HTTP Proxy</Trans></h2>
        <Input
          placeholder={_i18n._(t`Type HTTP proxy url (example: http://proxy.acme.org:8080)`)}
          value={preferences.httpsProxy}
          onChange={v => preferences.httpsProxy = v}
        />
        <small className="hint">
          <Trans>Proxy is used only for non-cluster communication.</Trans>
        </small>

        <h2><Trans>Certificate Trust</Trans></h2>
        <Checkbox
          label={<Trans>Allow untrusted Certificate Authorities</Trans>}
          value={preferences.allowUntrustedCAs}
          onChange={v => preferences.allowUntrustedCAs = v}
        />
        <small className="hint">
          <Trans>This will make Lens to trust ANY certificate authority without any validations.</Trans>{" "}
          <Trans>Needed with some corporate proxies that do certificate re-writing.</Trans>{" "}
          <Trans>Does not affect cluster communications!</Trans>
        </small>

        <h2><Trans>Telemetry & Usage Tracking</Trans></h2>
        <Checkbox
          label={<Trans>Allow telemetry & usage tracking</Trans>}
          value={preferences.allowTelemetry}
          onChange={v => preferences.allowTelemetry = v}
        />
        <small className="hint">
          <Trans>Telemetry & usage data is collected to continuously improve the Lens experience.</Trans>
        </small>
      </WizardLayout>
    )
  }
}
