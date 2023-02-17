/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-details.scss";

import React from "react";
import { observer } from "mobx-react";
import type { IComputedValue } from "mobx";
import { Drawer } from "../drawer";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import { KubeObjectMenu } from "../kube-object-menu";
import type { HideDetails } from "../kube-detail-params/hide-details.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import kubeObjectDetailItemsInjectable
  from "./kube-object-detail-items/kube-object-detail-items.injectable";
import type {
  KubeObjectDetailsItemComputed,
} from "./current-kube-object-in-details.injectable";
import {
  currentKubeObjectInDetailsInjectable2,
} from "./current-kube-object-in-details.injectable";

export interface KubeObjectDetailsProps<Kube extends KubeObject = KubeObject> {
  className?: string;
  object: Kube;
}

interface Dependencies {
  detailComponents: IComputedValue<React.ElementType[]>;
  kubeObject: KubeObjectDetailsItemComputed;
  hideDetails: HideDetails;
}

const NonInjectedKubeObjectDetails = observer((props: Dependencies) => {
  const {
    detailComponents,
    hideDetails,
    kubeObject,
  } = props;

  const object = kubeObject.get();

  return (
    <Drawer
      className="KubeObjectDetails flex column"
      open={!!object}
      title={
        object instanceof KubeObject ? `${object.kind}: ${object.getName()}` : ""
      }
      toolbar={object && <KubeObjectMenu object={object as KubeObject} toolbar />}
      onClose={hideDetails}
    >
      {!object && <Spinner center />}
      {object instanceof Error && (
        <div className="box center">
          Resource loading has failed:
          <b>{object}</b>
        </div>
      )}
      {object && detailComponents.get()
        .map((Component, index) => <Component key={index} object={object} />)}
    </Drawer>
  );
});

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    ...props,
    hideDetails: di.inject(hideDetailsInjectable),
    detailComponents: di.inject(kubeObjectDetailItemsInjectable),
    kubeObject: di.inject(currentKubeObjectInDetailsInjectable2),
  }),
});
