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
import { Switch } from "../../../../../../renderer/components/switch";

interface Dependencies {
  userStore: UserStore;
}

const NonInjectedAllowUntrustedCertificates = observer(({ userStore }: Dependencies) => (
  <section className="small">
    <SubTitle title="Certificate Trust" />
    <Switch
      checked={userStore.allowUntrustedCAs}
      onChange={() =>
        (userStore.allowUntrustedCAs = !userStore.allowUntrustedCAs)
      }
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

export const AllowUntrustedCertificates = withInjectables<Dependencies>(
  NonInjectedAllowUntrustedCertificates,

  {
    getProps: (di) => ({
      userStore: di.inject(userStoreInjectable),
    }),
  },
);
