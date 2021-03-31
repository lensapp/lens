import React from "react";
import { autobind, cssNames } from "../../utils";
import { KubeObject } from "../../api/kube-object";
import { editResourceTab } from "../dock/edit-resource.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { hideDetails } from "./kube-object-details";
import { apiManager } from "../../api/api-manager";
import { kubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";

export interface KubeObjectMenuProps<T> extends MenuActionsProps {
  object: T | null | undefined;
  editable?: boolean;
  removable?: boolean;
}

export class KubeObjectMenu<T extends KubeObject> extends React.Component<KubeObjectMenuProps<T>> {
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

    if (!object) {
      return null;
    }

    return (
      <p>Remove {object.kind} <b>{object.getName()}</b>?</p>
    );
  }

  getMenuItems(object: T): React.ReactChild[] {
    if (!object) {
      return [];
    }

    return kubeObjectMenuRegistry
      .getItemsForKind(object.kind, object.apiVersion)
      .map(({components: { MenuItem }}, index) => (
        <MenuItem
          object={object}
          key={`menu-item-${index}`}
          toolbar={toolbar}
        />
      ));
  }

  render() {
    const { remove, update, renderRemoveMessage, isEditable, isRemovable } = this;
    const { className, object, editable, removable, ...menuProps } = this.props;

    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={isEditable ? update : undefined}
        removeAction={isRemovable ? remove : undefined}
        removeConfirmationMessage={renderRemoveMessage}
        {...menuProps}
      >
        {this.getMenuItems(object)}
      </MenuActions>
    );
  }
}
