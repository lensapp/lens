/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { autoBind, cssNames } from "../../utils";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { MenuActionsProps } from "../menu";
import { MenuActions } from "../menu";
import identity from "lodash/identity";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterNameInjectable from "./dependencies/cluster-name.injectable";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import hideDetailsInjectable from "./dependencies/hide-details.injectable";
import kubeObjectMenuItemsInjectable from "./dependencies/kube-object-menu-items/kube-object-menu-items.injectable";
import apiManagerInjectable from "./dependencies/api-manager.injectable";

export interface KubeObjectMenuProps<TKubeObject extends KubeObject> extends MenuActionsProps {
  object: TKubeObject;
  editable?: boolean;
  removable?: boolean;
}

interface Dependencies {
  apiManager: ApiManager;
  kubeObjectMenuItems: React.ElementType[];
  clusterName: string | undefined;
  hideDetails: () => void;
  createEditResourceTab: (kubeObject: KubeObject) => void;
}

class NonInjectedKubeObjectMenu<TKubeObject extends KubeObject, Props extends KubeObjectMenuProps<TKubeObject> & Dependencies> extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
  }

  get store() {
    const { object } = this.props;

    if (!object?.selfLink) return null;

    return this.props.apiManager.getStore(object.selfLink);
  }

  get isEditable() {
    return this.props.editable ?? Boolean(this.store?.patch);
  }

  get isRemovable() {
    return this.props.removable ?? Boolean(this.store?.remove);
  }

  async update(object: KubeObject) {
    this.props.hideDetails();
    this.props.createEditResourceTab(object);
  }

  async remove(object: KubeObject) {
    const { hideDetails, removeAction = this.store?.remove } = this.props;

    hideDetails();
    await removeAction?.(object);
  }

  renderRemoveMessage() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    const breadcrumbParts = [object.getNs(), object.getName()];

    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>
        {`Remove ${object.kind} `}
        <b>{breadcrumb}</b>
        {" from "}
        <b>{this.props.clusterName}</b>
        ?
      </p>
    );
  }

  getMenuItems(object: KubeObject, toolbar: boolean): React.ReactChild[] {
    if (!object) {
      return [];
    }

    return this.props.kubeObjectMenuItems.map((MenuItem, index) => (
      <MenuItem
        object={object}
        toolbar={toolbar}
        key={`menu-item-${index}`}
      />
    ));
  }

  render() {
    const { remove, update, renderRemoveMessage, isEditable, isRemovable } = this;
    const { className, editable, removable, object, ...menuProps } = this.props;

    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={object && isEditable ? (() => update(object)) : undefined}
        removeAction={object && isRemovable ? (() => remove(object)) : undefined}
        removeConfirmationMessage={renderRemoveMessage}
        {...menuProps}
      >
        {this.getMenuItems(object, this.props.toolbar ?? false)}
      </MenuActions>
    );
  }
}

const InjectedKubeObjectMenu = withInjectables<Dependencies, KubeObjectMenuProps<KubeObject>>(NonInjectedKubeObjectMenu, {
  getProps: (di, props) => ({
    ...props,
    clusterName: di.inject(clusterNameInjectable),
    apiManager: di.inject(apiManagerInjectable),
    createEditResourceTab: di.inject(createEditResourceTabInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
    kubeObjectMenuItems: di.inject(kubeObjectMenuItemsInjectable, {
      kubeObject: props.object,
    }),
  }),
});

export function KubeObjectMenu<T extends KubeObject>(props: KubeObjectMenuProps<T>) {
  return <InjectedKubeObjectMenu {...props} />;
}
