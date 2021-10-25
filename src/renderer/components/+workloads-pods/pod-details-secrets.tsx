/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./pod-details-secrets.scss";

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { autorun, observable } from "mobx";
import { observer } from "mobx-react";
import { Pod, Secret, secretsApi } from "../../../common/k8s-api/endpoints";
import { getDetailsUrl } from "../kube-detail-params";

export interface PodDetailsSecretsProps {
  pod: Pod;
}

export const PodDetailsSecrets = observer(({ pod }: PodDetailsSecretsProps) => {
  const [secrets] = useState(observable.map<string, Secret>());

  useEffect(() => autorun(async () => {
    const podSecrets = await Promise.all(
      pod.getSecrets().map(secretName => secretsApi.get({
        name: secretName,
        namespace: pod.getNs(),
      })),
    );

    secrets.replace(podSecrets.filter(Boolean).map(secret => [secret.getName(), secret]));
  }), []);

  const renderSecret = (name: string) => {
    const secret = secrets.get(name);

    if (!secret) {
      return <span key={name}>{name}</span>;
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

