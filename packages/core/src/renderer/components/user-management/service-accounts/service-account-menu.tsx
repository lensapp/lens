/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";

import type { KubeObjectMenuProps } from "../../kube-object-menu";
import type { ServiceAccount } from "@k8slens/kube-object";
import { MenuItem } from "../../menu";
import { Icon } from "../../icon";
import type { OpenServiceAccountKubeConfigDialog } from "../../kubeconfig-dialog/open-service-account-kube-config-dialog.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openServiceAccountKubeConfigDialogInjectable from "../../kubeconfig-dialog/open-service-account-kube-config-dialog.injectable";

interface Dependencies {
  openServiceAccountKubeConfigDialog: OpenServiceAccountKubeConfigDialog;
}

function NonInjectedServiceAccountMenu(props: KubeObjectMenuProps<ServiceAccount> & Dependencies) {
  const { object, toolbar, openServiceAccountKubeConfigDialog } = props;

  return (
    <MenuItem onClick={() => openServiceAccountKubeConfigDialog(object)}>
      <Icon
        material="insert_drive_file"
        tooltip="Kubeconfig File"
        interactive={toolbar}
      />
      <span className="title">Kubeconfig</span>
    </MenuItem>
  );
}

export const ServiceAccountMenu = withInjectables<Dependencies, KubeObjectMenuProps<ServiceAccount>>(NonInjectedServiceAccountMenu, {
  getProps: (di, props) => ({
    ...props,
    openServiceAccountKubeConfigDialog: di.inject(openServiceAccountKubeConfigDialogInjectable),
  }),
});
