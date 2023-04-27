/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import { computed } from "mobx";
import type { KubeObjectMenuItemComponent, KubeObjectMenuItem } from "../kube-object-menu/kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu/kube-object-menu-item-injection-token";
import { ingressClassSetDefaultInjectable } from "./ingress-class-set-default.injectable";
import { MenuItem } from "../menu";
import type { IngressClass } from "@k8slens/kube-object";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { Icon } from "../icon";
import hideDetailsInjectable from "../kube-detail-params/hide-details.injectable";

export interface IngressClassMenuProps extends KubeObjectMenuProps<IngressClass> {
}

export interface Dependencies {
  setDefault: (item: IngressClass) => Promise<void>;
  hideDetails: () => void;
}

export function NonInjectedIngressClassMenu(props: IngressClassMenuProps & Dependencies) {
  const {
    object,
    toolbar,
    setDefault,
    hideDetails,
  } = props;

  function markItemAsDefaultIngressClass() {
    void setDefault(object);
    hideDetails();
  }

  return (
    <>
      <MenuItem onClick={markItemAsDefaultIngressClass}>
        <Icon
          material="star"
          tooltip="Set as default"
          interactive={toolbar} />
        <span className="title">Set as default</span>
      </MenuItem>
    </>
  );
}

export const IngressClassMenu = withInjectables<Dependencies, IngressClassMenuProps>(NonInjectedIngressClassMenu, {
  getProps: (di, props) => ({
    ...props,
    setDefault: di.inject(ingressClassSetDefaultInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
  }),
});


const ingressClassMenuInjectable = getInjectable({
  id: "ingress-class-kube-object-menu",

  instantiate(): KubeObjectMenuItem {
    return {
      kind: "IngressClass",
      apiVersions: ["networking.k8s.io/v1"],
      Component: IngressClassMenu as KubeObjectMenuItemComponent,
      enabled: computed(() => true),
      orderNumber: 30,
    };
  },

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default ingressClassMenuInjectable;
