/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import type { VolumeVariantComponent } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

export const Secret: VolumeVariantComponent<"secret"> = (
  ({ pod, variant: { secretName, items = [], defaultMode = 0o644, optional = false }}) => (
    <>
      <LocalRef
        pod={pod}
        title="Name"
        kubeRef={{ name: secretName }}
        api={secretApi}
      />
      <DrawerItem name="Items" hidden={items.length === 0}>
        <ul>
          {items.map(({ key }) => <li key={key}>{key}</li>)}
        </ul>
      </DrawerItem>
      <DrawerItem name="Default File Mode">
        {`0o${defaultMode.toString(8)}`}
      </DrawerItem>
      <DrawerItem name="Optional">
        {optional.toString()}
      </DrawerItem>
    </>
  )
);
