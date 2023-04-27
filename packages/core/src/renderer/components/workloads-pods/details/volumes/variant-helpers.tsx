/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { Link } from "react-router-dom";
import type { PodVolumeVariants, Pod, SecretReference, LocalObjectReference } from "@k8slens/kube-object";
import type { KubeApiQueryParams, ResourceDescriptor } from "../../../../../common/k8s-api/kube-api";
import { DrawerItem } from "../../../drawer";
import type { GetDetailsUrl } from "../../../kube-detail-params/get-details-url.injectable";
import getDetailsUrlInjectable from "../../../kube-detail-params/get-details-url.injectable";

export interface PodVolumeVariantSpecificProps<Kind extends keyof PodVolumeVariants> {
  variant: PodVolumeVariants[Kind];
  pod: Pod;
  volumeName: string;
}

export type VolumeVariantComponent<Kind extends keyof PodVolumeVariants> = React.FunctionComponent<PodVolumeVariantSpecificProps<Kind>>;

export interface LocalRefPropsApi {
  getUrl(desc?: Partial<ResourceDescriptor>, query?: Partial<KubeApiQueryParams>): string;
}

export interface LocalRefProps {
  pod: Pod;
  title: string;
  kubeRef: LocalObjectReference | SecretReference | undefined;
  api: LocalRefPropsApi;
}

interface Dependencies {
  getDetailsUrl: GetDetailsUrl;
}

const NonInjectedLocalRef = (props: LocalRefProps & Dependencies) => {
  const {
    pod,
    title,
    kubeRef,
    api,
    getDetailsUrl,
  } = props;

  if (!kubeRef) {
    return null;
  }

  return (
    <DrawerItem name={title}>
      <Link to={getDetailsUrl(api.getUrl({ namespace: pod.getNs(), ...kubeRef }))}>
        {kubeRef.name}
      </Link>
    </DrawerItem>
  );
};

export const LocalRef = withInjectables<Dependencies, LocalRefProps>(NonInjectedLocalRef, {
  getProps: (di, props) => ({
    ...props,
    getDetailsUrl: di.inject(getDetailsUrlInjectable),
  }),
});
