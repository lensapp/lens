/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./lease-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { Lease } from "@k8slens/kube-object";

export const LeaseDetails = observer((props: KubeObjectDetailsProps) => {
  const lease = props.object as Lease;

  return (
    <div className="LeaseDetails">
      <DrawerItem name="Holder Identity">
        {lease.getHolderIdentity()}
      </DrawerItem>

      <DrawerItem name="Lease Duration Seconds">
        {lease.getLeaseDurationSeconds()}
      </DrawerItem>

      <DrawerItem name="Lease Transitions" hidden={lease.getLeaseTransitions() === undefined}>
        {lease.getLeaseTransitions()}
      </DrawerItem>

      <DrawerItem name="Acquire Time" hidden={lease.getAcquireTime() === ""}>
        {lease.getAcquireTime()}
      </DrawerItem>

      <DrawerItem name="Renew Time">
        {lease.getRenewTime()}
      </DrawerItem>
    </div >
  );
});
