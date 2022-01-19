/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observer } from "mobx-react";
import React from "react";

import { UserStore } from "../../../common/user-store";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import { Switch } from "../switch";

export const LensProxy = observer(() => {
  const [proxy, setProxy] = React.useState(UserStore.getInstance().httpsProxy || "");
  const store = UserStore.getInstance();

  return (
    <section id="proxy">
      <section>
        <h2 data-testid="proxy-header">Proxy</h2>
        <SubTitle title="HTTP Proxy"/>
        <Input
          theme="round-black"
          placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
          value={proxy}
          onChange={v => setProxy(v)}
          onBlur={() => UserStore.getInstance().httpsProxy = proxy}
        />
        <small className="hint">
          Proxy is used only for non-cluster communication.
        </small>
      </section>

      <hr className="small"/>

      <section className="small">
        <SubTitle title="Certificate Trust"/>
        <Switch checked={store.allowUntrustedCAs} onChange={() => store.allowUntrustedCAs = !store.allowUntrustedCAs}>
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
