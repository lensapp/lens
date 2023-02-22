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
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";
import { type IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import kubeObjectDetailItemsInjectable
  from "./kube-object-detail-items/kube-object-detail-items.injectable";
import type {
  KubeObjectDetailsItem,
  KubeObjectDetailsValue,
} from "./current-kube-object-in-details.injectable";
import currentKubeObjectInDetailsInjectable from "./current-kube-object-in-details.injectable";

export interface KubeObjectDetailsProps<Kube extends KubeObject = KubeObject> {
  className?: string;
  object: Kube;
}

interface Dependencies {
  detailComponents: IComputedValue<React.ElementType[]>;
  kubeObjectDetails: IAsyncComputed<KubeObjectDetailsValue>;
  hideDetails: HideDetails;
}

const NonInjectedKubeObjectDetails = observer((props: Dependencies) => {
  const {
    detailComponents,
    hideDetails,
    kubeObjectDetails,
  } = props;

  const kubeObject = kubeObjectDetails.value.get();
  const isError = kubeObject instanceof Error;
  const isLoading = kubeObjectDetails.pending.get();

  const title = (kubeObject instanceof KubeObject)
    ? `${kubeObject.kind}: ${kubeObject.getName()}`
    : "KubeResourceDetails";

  return (
    <Drawer
      className="KubeObjectDetails flex column"
      open={!!kubeObject}
      title={title}
      toolbar={kubeObject &&
        <KubeObjectMenu object={kubeObject as KubeObjectDetailsItem} toolbar />}
      onClose={hideDetails}
    >
      {isLoading && <Spinner center />}

      {isError ? (
        <div className="box center">
          Resource loading has failed:
          {" "}
          <b>{String(kubeObject)}</b>
        </div>
      ) : (
        kubeObject && detailComponents.get()
          .map((Component, index) => <Component key={index} object={kubeObject} />)
      )}
    </Drawer>
  );
});

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    ...props,
    hideDetails: di.inject(hideDetailsInjectable),
    detailComponents: di.inject(kubeObjectDetailItemsInjectable),
    kubeObjectDetails: di.inject(currentKubeObjectInDetailsInjectable),
  }),
});
