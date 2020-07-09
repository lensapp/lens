import React from "react";
import { Trans } from "@lingui/macro";
import { autobind, cssNames } from "../../utils";
import { KubeObject } from "../../api/kube-object";
import { editResourceTab } from "../dock/edit-resource.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { hideDetails } from "../../navigation";
import { apiManager } from "../../api/api-manager";
import { KubeObjectStore } from "client/kube-object.store";

export interface KubeObjectMenuProps<T extends KubeObject = any> extends MenuActionsProps {
  object: T;
  editable?: boolean;
  removable?: boolean;
}

export class KubeObjectMenu extends React.Component<KubeObjectMenuProps> {
  get store(): KubeObjectStore<any> {
    const { object } = this.props;
    if (!object) {
      return;
    }
    return apiManager.getStore(object.selfLink);
  }

  get isEditable(): boolean {
    const { editable } = this.props;
    return editable !== undefined ? editable : !!(this.store && this.store.update);
  }

  get isRemovable(): boolean  {
    const { removable } = this.props;
    return removable !== undefined ? removable : !!(this.store && this.store.remove);
  }

  @autobind()
  update(): void {
    hideDetails();
    editResourceTab(this.props.object);
  }

  @autobind()
  async remove(): Promise<void> {
    hideDetails();
    const { object, removeAction } = this.props;
    if (removeAction) {
      removeAction();
    } else {
      await this.store.remove(object);
    }
  }

  @autobind()
  renderRemoveMessage(): JSX.Element {
    const { object } = this.props;
    const resourceKind = object.kind;
    const resourceName = object.getName();
    return (
      <p><Trans>Remove {resourceKind} <b>{resourceName}</b>?</Trans></p>
    );
  }

  render(): JSX.Element {
    const { remove, update, renderRemoveMessage, isEditable, isRemovable } = this;
    const { className, object: _object, editable: _editable, removable: _removable, ...menuProps } = this.props;
    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={isEditable ? update : undefined}
        removeAction={isRemovable ? remove : undefined}
        removeConfirmationMessage={renderRemoveMessage}
        {...menuProps}
      />
    );
  }
}
