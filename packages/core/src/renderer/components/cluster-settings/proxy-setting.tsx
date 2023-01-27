/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect, useState } from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { Input, InputValidators } from "../input";
import { SubTitle } from "../layout/sub-title";

export interface ClusterProxySettingProps {
  cluster: Cluster;
}

export const ClusterProxySetting = observer((props: ClusterProxySettingProps) => {
  const { cluster } = props;

  const [httpsProxy, setHttpsProxy] = useState(cluster.preferences.httpsProxy || "");
  const [noProxy, setNoProxy] = useState(cluster.preferences.noProxy || "");

  useEffect(() => action(() => {
    cluster.preferences.httpsProxy = httpsProxy;
    cluster.preferences.noProxy = noProxy;
  }), []);

  return (
    <>
      <SubTitle title="HTTPS Proxy" id="http-proxy" />
      <Input
        theme="round-black"
        value={httpsProxy}
        onChange={setHttpsProxy}
        onBlur={() => {
          props.cluster.preferences.httpsProxy = httpsProxy;
        }}
        placeholder="https://<address>:<port>"
        validators={httpsProxy ? InputValidators.isUrl : undefined}
      />
      <small className="hint">
        HTTPS Proxy server. Used for communicating with Kubernetes API.
      </small>
      <SubTitle title="No Proxy" id="no-proxy" />
      <Input
        theme="round-black"
        value={noProxy}
        onChange={setNoProxy}
        onBlur={() => {
          props.cluster.preferences.noProxy = noProxy;
        }}
        placeholder=""
        validators={noProxy ? InputValidators.isUrl : undefined}
      />
      <small className="hint">
        NO_PROXY configuration. Useful for when specifying that cluster communication shouldn&apos;t go through the default proxy.
      </small>
    </>
  );
});
