/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { SecretApi } from "@k8slens/kube-api";
import { secretApiInjectable } from "@k8slens/kube-api-specifics";
import { DrawerItem } from "../../../../drawer";
import type { PodVolumeVariantSpecificProps } from "../variant-helpers";
import { LocalRef } from "../variant-helpers";

interface Dependencies {
  secretApi: SecretApi;
}

const NonInjectedSecret = (props: PodVolumeVariantSpecificProps<"secret"> & Dependencies) => {
  const {
    pod,
    variant: { secretName, items = [], defaultMode = 0o644, optional = false },
    secretApi,
  } = props;

  return (
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
  );
};

export const Secret = withInjectables<Dependencies, PodVolumeVariantSpecificProps<"secret">>(NonInjectedSecret, {
  getProps: (di, props) => ({
    ...props,
    secretApi: di.inject(secretApiInjectable),
  }),
});
