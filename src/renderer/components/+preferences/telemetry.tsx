/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import type { UserPreferencesStore } from "../../../common/user-preferences";
import { sentryDsn } from "../../../common/vars";
import { Checkbox } from "../checkbox";
import { SubTitle } from "../layout/sub-title";
import { ExtensionSettings } from "./extension-settings";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import appPreferencesInjectable from "./app-preferences/app-preferences.injectable";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";

interface Dependencies {
  appPreferenceItems: IComputedValue<RegisteredAppPreference[]>;
  userStore: UserPreferencesStore;
}

const NonInjectedTelemetry = observer(({ appPreferenceItems, userStore }: Dependencies) => {
  const extensions = appPreferenceItems.get();
  const telemetryExtensions = extensions.filter(e => e.showInPreferencesTab == "telemetry");

  return (
    <section id="telemetry">
      <h2 data-testid="telemetry-header">Telemetry</h2>
      {telemetryExtensions.map((extension) => <ExtensionSettings key={extension.id} setting={extension} size="small" />)}
      {sentryDsn ? (
        <React.Fragment key='sentry'>
          <section id='sentry' className="small">
            <SubTitle title='Automatic Error Reporting' />
            <Checkbox
              label="Allow automatic error reporting"
              value={userStore.allowErrorReporting}
              onChange={value => {
                userStore.allowErrorReporting = value;
              }}
            />
            <div className="hint">
              <span>
              Automatic error reports provide vital information about issues and application crashes.
              It is highly recommended to keep this feature enabled to ensure fast turnaround for issues you might encounter.
              </span>
            </div>
          </section>
          <hr className="small" />
        </React.Fragment>) :
        // we don't need to shows the checkbox at all if Sentry dsn is not a valid url
        null
      }
    </section>
  );
});

export const Telemetry = withInjectables<Dependencies>(NonInjectedTelemetry, {
  getProps: (di) => ({
    appPreferenceItems: di.inject(appPreferencesInjectable),
    userStore: di.inject(userPreferencesStoreInjectable),
  }),
});
