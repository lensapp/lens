/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import withConfirmationInjectable, { WithConfirmation } from "../confirm-dialog/with-confirm.injectable";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import { Icon } from "../icon";
import { MenuItem } from "../menu";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import deleteNamespaceInjectable from "./delete-namespace.injectable";
import type { NamespaceStore } from "./store";
import namespaceStoreInjectable from "./store.injectable";

export interface NamespaceMenuProps extends MenuActionsProps {
  namespace: Namespace;
}

interface Dependencies {
  readonly namespaceStore: NamespaceStore;
  readonly createEditResourceTab: (kubeObject: KubeObject) => void;
  readonly withConfirmation: WithConfirmation;
  readonly deleteNamespace: (namespace: Namespace) => Promise<void>;
}

function NonInjectedNamespaceMenu(props: NamespaceMenuProps & Dependencies) {
  const { namespace, namespaceStore, deleteNamespace, createEditResourceTab, withConfirmation } = props;

  const remove = async () => {
    deleteNamespace(namespace);
    namespaceStore.clearSelected();
  };

  const renderRemoveMessage = (object: KubeObject) => {
    return (
      <p>
        Remove <b>{object.getName()}</b>?
      </p>
    );
  }

  return (
    <MenuActions {...props}>
      <MenuItem onClick={() => createEditResourceTab(namespace)}>
        <Icon material="edit" interactive={false} tooltip="Edit" />
        <span className="title">Edit</span>
      </MenuItem>
      <MenuItem onClick={withConfirmation({
        message: renderRemoveMessage(namespace),
        labelOk: "Remove",
        ok: remove,
      })}>
        <Icon material="delete" interactive={false} tooltip="Delete" />
        <span className="title">Delete</span>
      </MenuItem>
    </MenuActions>
  );
}

export const NamespaceMenu = withInjectables<Dependencies, NamespaceMenuProps>(NonInjectedNamespaceMenu, {
  getProps: (di, props) => ({
    ...props,
    namespaceStore: di.inject(namespaceStoreInjectable),
    createEditResourceTab: di.inject(createEditResourceTabInjectable),
    withConfirmation: di.inject(withConfirmationInjectable),
    deleteNamespace: di.inject(deleteNamespaceInjectable),
  }),
});