/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./ingress-class-details.module.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import type { IngressClass } from "@k8slens/kube-object";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { Badge } from "../badge";

export const IngressClassDetails = observer((props: KubeObjectDetailsProps) => {
  const ingressClass = props.object as IngressClass;

  return (
    <div className={styles.IngressClassDetails}>
      <DrawerItem name="Controller">
        <Badge label={ingressClass.getController()} />
      </DrawerItem>
      {ingressClass.spec.parameters && (
        <>
          <DrawerTitle>Parameters</DrawerTitle>
          <DrawerItem name="Name">
            {ingressClass.getCtrlName()}
          </DrawerItem>
          <DrawerItem name="Namespace">
            {ingressClass.getCtrlNs()}
          </DrawerItem>
          <DrawerItem name="Scope">
            {ingressClass.getCtrlScope()}
          </DrawerItem>
          <DrawerItem name="Kind">
            {ingressClass.getCtrlKind()}
          </DrawerItem>
          <DrawerItem name="API Group">
            {ingressClass.getCtrlApiGroup()}
          </DrawerItem>
        </>
      )}
    </div>
  );
});
