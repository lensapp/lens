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
