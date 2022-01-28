/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import type { UserPreferencesStore } from "../../../common/user-preferences";
import userPreferencesStoreInjectable from "../../../common/user-preferences/store.injectable";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import { Switch } from "../switch";

interface Dependencies {
  userStore: UserPreferencesStore;
}

const NonInjectedLensProxy = observer(({ userStore }: Dependencies) => {
  const [proxy, setProxy] = React.useState(userStore.httpsProxy || "");

  return (
    <section id="proxy">
      <section>
        <h2 data-testid="proxy-header">Proxy</h2>
        <SubTitle title="HTTP Proxy"/>
        <Input
          theme="round-black"
          placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
          value={proxy}
          onChange={setProxy}
          onBlur={() => userStore.httpsProxy = proxy}
        />
        <small className="hint">
          Proxy is used only for non-cluster communication.
        </small>
      </section>

      <hr className="small"/>

      <section className="small">
        <SubTitle title="Certificate Trust"/>
        <Switch
          checked={userStore.allowUntrustedCAs}
          onChange={() => userStore.allowUntrustedCAs = !userStore.allowUntrustedCAs}
        >
          Allow untrusted Certificate Authorities
        </Switch>
        <small className="hint">
          This will make Lens to trust ANY certificate authority without any validations.{" "}
          Needed with some corporate proxies that do certificate re-writing.{" "}
          Does not affect cluster communications!
        </small>
      </section>
    </section>
  );
});

export const LensProxy = withInjectables<Dependencies>(NonInjectedLensProxy, {
  getProps: (di, props) => ({
    userStore: di.inject(userPreferencesStoreInjectable),
    ...props,
  }),
});
