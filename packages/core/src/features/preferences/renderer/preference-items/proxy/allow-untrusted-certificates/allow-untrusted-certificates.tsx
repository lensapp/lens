/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Switch } from "../../../../../../renderer/components/switch";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedAllowUntrustedCertificates = observer(({ state }: Dependencies) => (
  <section className="small">
    <SubTitle title="Certificate Trust" />
    <Switch
      checked={state.allowUntrustedCAs}
      onChange={() => state.allowUntrustedCAs = !state.allowUntrustedCAs}
    >
      Allow untrusted Certificate Authorities
    </Switch>
    <small className="hint">
      This will make Lens to trust ANY certificate authority without any
      validations. Needed with some corporate proxies that do certificate
      re-writing. Does not affect cluster communications!
    </small>
  </section>
));

export const AllowUntrustedCertificates = withInjectables<Dependencies>(NonInjectedAllowUntrustedCertificates, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
