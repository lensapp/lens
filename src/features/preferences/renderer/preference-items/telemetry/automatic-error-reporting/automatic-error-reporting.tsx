/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserStore } from "../../../../../../common/user-store";
import userStoreInjectable from "../../../../../../common/user-store/user-store.injectable";
import { observer } from "mobx-react";
import { Checkbox } from "../../../../../../renderer/components/checkbox";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedAutomaticErrorReporting = observer(({ userStore }: Dependencies) => (
  <div
    id="sentry"
    className="small"
    data-testid="telemetry-preferences-for-automatic-error-reporting"
  >
    <SubTitle title="Automatic Error Reporting" />
    <Checkbox
      label="Allow automatic error reporting"
      value={userStore.allowErrorReporting}
      onChange={(value) => (userStore.allowErrorReporting = value)}
    />
    <div className="hint">
      <span>
        Automatic error reports provide vital information about issues and
        application crashes. It is highly recommended to keep this feature
        enabled to ensure fast turnaround for issues you might encounter.
      </span>
    </div>
  </div>
));

export const AutomaticErrorReporting = withInjectables<Dependencies>(
  NonInjectedAutomaticErrorReporting,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
