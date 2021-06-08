/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import { boundMethod, cssNames } from "../../utils";
import type { KubeObject } from "../../api/kube-object";
import { editResourceTab } from "../dock/edit-resource.store";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import { hideDetails } from "../kube-details";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMenuRegistry } from "../../../extensions/registries/kube-object-menu-registry";

export interface KubeObjectMenuProps<T> extends MenuActionsProps {
  object: T | null | undefined;
  editable?: boolean;
  removable?: boolean;
}

export class KubeObjectMenu<T extends KubeObject> extends React.Component<KubeObjectMenuProps<T>> {
  get store() {
    const { object } = this.props;

    if (!object) return null;

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

  @boundMethod
  async update() {
    hideDetails();
    editResourceTab(this.props.object);
  }

  @boundMethod
  async remove() {
    hideDetails();
    const { object, removeAction } = this.props;

    if (removeAction) await removeAction();
    else await this.store.remove(object);
  }

  @boundMethod
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

    return KubeObjectMenuRegistry
      .getInstance()
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
