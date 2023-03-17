/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Input } from "../../../../../../renderer/components/input";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedHttpProxyUrl = observer(({
  state,
}: Dependencies) => {
  const [proxy, setProxy] = React.useState(state.httpsProxy || "");

  return (
    <section>
      <SubTitle title="HTTP Proxy" />
      <Input
        theme="round-black"
        placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
        value={proxy}
        onChange={(v) => setProxy(v)}
        onBlur={() => (state.httpsProxy = proxy)}
      />
      <small className="hint">
        Proxy is used only for non-cluster communication.
      </small>
    </section>
  );
});

export const HttpProxyUrl = withInjectables<Dependencies>(NonInjectedHttpProxyUrl, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
