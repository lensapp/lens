/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details-secrets.scss";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { observer } from "mobx-react";
import type { Pod, Secret, SecretApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";
import { withInjectables } from "@ogre-tools/injectable-react";
import secretApiInjectable from "../../../common/k8s-api/endpoints/secret.api.injectable";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

interface Dependencies {
  secretApi: SecretApi;
}

const NonInjectedPodDetailsSecrets = observer(({ secretApi, pod }: Dependencies & PodDetailsSecretsProps) => {
  const [secrets] = useState(observable.map<string, Secret>());

  useEffect(() => autorun(async () => {
    const getSecrets = await Promise.all(
      pod.getSecrets().map(secretName => secretApi.get({
        name: secretName,
        namespace: pod.getNs(),
      })),
    );

    for (const secret of getSecrets) {
      if (secret) {
        secrets.set(secret.getName(), secret);
      }
    }
  }), []);

  return (
    <div className="PodDetailsSecrets">
      {
        pod.getSecrets().map(secretName => {
          const secret = secrets.get(secretName);

          return secret
            ? (
              <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
                {secret.getName()}
              </Link>
            )
            : (
              <span key={secretName}>
                {secretName}
              </span>
            );
        })
      }
    </div>
  );
});

export const PodDetailsSecrets = withInjectables<Dependencies, PodDetailsSecretsProps>(NonInjectedPodDetailsSecrets, {
  getProps: (di, props) => ({
    secretApi: di.inject(secretApiInjectable),
    ...props,
  }),
});
