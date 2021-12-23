/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { observer } from "mobx-react";
import React from "react";
import { UserStore } from "../../../common/user-store";
import { sentryDsn } from "../../../common/vars";
import { AppPreferenceRegistry } from "../../../extensions/registries";
import { Checkbox } from "../checkbox";
import { SubTitle } from "../layout/sub-title";
import { ExtensionSettings } from "./extension-settings";

export const Telemetry = observer(() => {
  const extensions = AppPreferenceRegistry.getInstance().getItems();
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
              value={UserStore.getInstance().allowErrorReporting}
              onChange={value => {
                UserStore.getInstance().allowErrorReporting = value;
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
