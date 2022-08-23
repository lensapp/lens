/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-secrets.scss";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import type { Pod, Secret } from "../../../common/k8s-api/endpoints";
import { secretApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

export const PodDetailsSecrets = observer(({ pod }: PodDetailsSecretsProps) => {
  const [secrets, setSecrets] = useState(new Map<string, Secret>());

  useEffect(() => (
    reaction(
      () => pod.getSecrets(),
      async (secretNames) => {
        const results = await Promise.allSettled(
          secretNames.map(secretName => secretApi.get({
            name: secretName,
            namespace: pod.getNs(),
          })),
        );

        setSecrets(new Map(
          results
            .filter(result => result.status === "fulfilled" && result.value)
            .map(result => (result as PromiseFulfilledResult<Secret>).value)
            .map(secret => [secret.getName(), secret]),
        ));
      },
      {
        fireImmediately: true,
      })
  ), []);

  const renderSecret = (name: string) => {
    const secret = secrets.get(name);

    if (!secret) {
      return (
        <span key={name}>
          {name}
        </span>
      );
    }

    return (
      <Link key={secret.getId()} to={getDetailsUrl(secret.selfLink)}>
        {secret.getName()}
      </Link>
    );
  };

  return (
    <div className="PodDetailsSecrets">
      {pod.getSecrets().map(renderSecret)}
    </div>
  );
});

