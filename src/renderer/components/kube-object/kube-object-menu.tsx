import React from "react";
import { Trans } from "@lingui/macro";
import { autobind, cssNames } from "../../utils";
import { KubeObject } from "../../api/kube-object";
import { editResourceTab } from "../dock/edit-resource.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { hideDetails } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";

export interface KubeObjectMenuProps<T extends KubeObject = any> extends MenuActionsProps {
  object: T;
  editable?: boolean;
  removable?: boolean;
}

export class KubeObjectMenu extends React.Component<KubeObjectMenuProps> {
  get store() {
    const { object } = this.props;
    if (!object) return;
    return apiManager.getStore(object.selfLink);
  }

  get isEditable() {
    const { editable } = this.props;
    return editable !== undefined ? editable : !!(this.store && this.store.update);
  }

  get isRemovable() {
    const { removable } = this.props;
    return removable !== undefined ? removable : !!(this.store && this.store.remove);
  }

  @autobind()
  async update() {
    hideDetails();
    editResourceTab(this.props.object);
  }

  @autobind()
  async remove() {
    hideDetails();
    const { object, removeAction } = this.props;
    if (removeAction) await removeAction();
    else await this.store.remove(object);
  }

  @autobind()
  renderRemoveMessage() {
    const { object } = this.props;
    const resourceKind = object.kind;
    const resourceName = object.getName();
    return (
      <p><Trans>Remove {resourceKind} <b>{resourceName}</b>?</Trans></p>
    )
  }

  render() {
    const { remove, update, renderRemoveMessage, isEditable, isRemovable } = this;
    const { className, object, editable, removable, toolbar, ...menuProps } = this.props;
    if (!object) return null;

    const menuItems = kubeObjectMenuRegistry.getItemsForKind(object.kind, object.apiVersion).map((item, index) => {
      return <item.components.MenuItem object={object} key={`menu-item-${index}`} toolbar={toolbar} />
    })
    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={isEditable ? update : undefined}
        removeAction={isRemovable ? remove : undefined}
        removeConfirmationMessage={renderRemoveMessage}
        toolbar={toolbar}
        {...menuProps}
      >
        {menuItems}
      </MenuActions>
    )
  }
}
