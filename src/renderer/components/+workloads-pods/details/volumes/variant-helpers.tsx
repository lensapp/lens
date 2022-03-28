/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { Link } from "react-router-dom";
import type { PodVolumeVariants, Pod, SecretReference } from "../../../../../common/k8s-api/endpoints";
import type { KubeApi } from "../../../../../common/k8s-api/kube-api";
import type { LocalObjectReference, KubeObject } from "../../../../../common/k8s-api/kube-object";
import { DrawerItem } from "../../../drawer";
import { getDetailsUrl } from "../../../kube-detail-params";

export interface PodVolumeVariantSpecificProps<Kind extends keyof PodVolumeVariants> {
  variant: PodVolumeVariants[Kind];
  pod: Pod;
  volumeName: string;
}

export type VolumeVariantComponent<Kind extends keyof PodVolumeVariants> = React.FunctionComponent<PodVolumeVariantSpecificProps<Kind>>;

export interface LocalRefProps {
  pod: Pod;
  title: string;
  kubeRef: LocalObjectReference | SecretReference | undefined;
  api: KubeApi<KubeObject>;
}

export const LocalRef = ({ pod, title, kubeRef: ref, api }: LocalRefProps) => {
  if (!ref) {
    return null;
  }

  return (
    <DrawerItem name={title}>
      <Link to={getDetailsUrl(api.getUrl({ namespace: pod.getNs(), ...ref }))}>
        {ref.name}
      </Link>
    </DrawerItem>
  );
};
