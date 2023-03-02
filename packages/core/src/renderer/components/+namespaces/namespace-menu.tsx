/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import { Icon } from "../icon";
import { MenuItem } from "../menu";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import removeSubnamespaceInjectable from "./remove-subnamespace.injectable";
import type { NamespaceStore } from "./store";
import namespaceStoreInjectable from "./store.injectable";

export interface NamespaceMenuProps extends MenuActionsProps {
  namespace: Namespace;
}

interface Dependencies {
  readonly removeSubnamespace: (name: string) => Promise<void>;
  readonly namespaceStore: NamespaceStore;
  readonly createEditResourceTab: (kubeObject: KubeObject) => void;
}

function NonInjectedNamespaceMenu(props: NamespaceMenuProps & Dependencies) {
  const { namespace, removeSubnamespace, namespaceStore, createEditResourceTab } = props;

  const remove = async () => {
    if (namespace.isSubnamespace()) {
      await removeSubnamespace(namespace.getName());
    } else {
      await namespaceStore.remove(namespace);
    }

    namespaceStore.clearSelected();
  };

  return (
    <MenuActions {...props}>
      <MenuItem onClick={() => createEditResourceTab(namespace)}>
        <Icon material="edit" interactive={false} tooltip="Edit" />
        <span className="title">Edit</span>
      </MenuItem>
      <MenuItem onClick={remove}>
        <Icon material="delete" interactive={false} tooltip="Delete" />
        <span className="title">Delete</span>
      </MenuItem>
    </MenuActions>
  );
}

export const NamespaceMenu = withInjectables<Dependencies, NamespaceMenuProps>(NonInjectedNamespaceMenu, {
  getProps: (di, props) => ({
    ...props,
    removeSubnamespace: di.inject(removeSubnamespaceInjectable),
    namespaceStore: di.inject(namespaceStoreInjectable),
    createEditResourceTab: di.inject(createEditResourceTabInjectable),
  }),
});