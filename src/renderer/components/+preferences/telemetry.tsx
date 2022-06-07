/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";
import type { UserStore } from "../../../common/user-store";
import { Checkbox } from "../checkbox";
import { SubTitle } from "../layout/sub-title";
import { ExtensionSettings } from "./extension-settings";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Preferences } from "./preferences";
import type { ExtensionTelemetryPreferenceRegistration } from "./telemetry-preference-items.injectable";
import telemetryPreferenceItemsInjectable from "./telemetry-preference-items.injectable";
import sentryDnsUrlInjectable from "./sentry-dns-url.injectable";
import userStoreInjectable from "../../../common/user-store/user-store.injectable";

interface Dependencies {
  telemetryPreferenceItems: IComputedValue<ExtensionTelemetryPreferenceRegistration[]>;
  sentryDnsUrl: string;
  userStore: UserStore;
}

const NonInjectedTelemetry: React.FC<Dependencies> = ({
  telemetryPreferenceItems,
  sentryDnsUrl,
  userStore,
}) => (
  <Preferences data-testid="telemetry-preferences-page">
    <section id="telemetry">
      <h2 data-testid="telemetry-header">Telemetry</h2>
      {telemetryPreferenceItems.get().map((item) => (
        <ExtensionSettings
          key={item.id}
          setting={item}
          size="small"
          data-testid={`telemetry-preference-item-for-${item.id}`}
        />
      ))}
      {sentryDnsUrl ? (
        <React.Fragment key="sentry">
          <section
            id="sentry"
            className="small"
            data-testid="telemetry-preferences-for-automatic-error-reporting"
          >
            <SubTitle title="Automatic Error Reporting" />
            <Checkbox
              label="Allow automatic error reporting"
              value={userStore.allowErrorReporting}
              onChange={(value) => userStore.allowErrorReporting = value}
            />
            <div className="hint">
              <span>
                Automatic error reports provide vital information about issues
                and application crashes. It is highly recommended to keep this
                feature enabled to ensure fast turnaround for issues you might
                encounter.
              </span>
            </div>
          </section>
          <hr className="small" />
        </React.Fragment>
      ) : // we don't need to shows the checkbox at all if Sentry dsn is not a valid url
        null}
    </section>
  </Preferences>
);

export const Telemetry = withInjectables<Dependencies>(
  observer(NonInjectedTelemetry),

  {
    getProps: (di) => ({
      telemetryPreferenceItems: di.inject(telemetryPreferenceItemsInjectable),
      sentryDnsUrl: di.inject(sentryDnsUrlInjectable),
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
