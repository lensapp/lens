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
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { MenuActions, MenuActionsProps } from "../menu/menu-actions";
import identity from "lodash/identity";

import type { IHasGettableItemsForKind } from "../../../extensions/registries";
import type { IGettableStore } from "../../../common/k8s-api/api-manager";
import type { IHasName } from "../../../main/cluster";

export interface KubeObjectMenuProps<TKubeObject> extends MenuActionsProps {
  object: TKubeObject | null | undefined;
  editable?: boolean;
  removable?: boolean;
  toolbar?: boolean;
}

interface KubeObjectMenuDependencies<TKubeObject>
  extends KubeObjectMenuProps<TKubeObject> {
  apiManager: IGettableStore;
  kubeObjectMenuRegistry: IHasGettableItemsForKind;
  cluster: IHasName;
  hideDetails: () => void;
  editResourceTab: (kubeObject: TKubeObject) => void;
}

export class KubeObjectMenu<
  TKubeObject extends KubeObject,
> extends React.Component<KubeObjectMenuDependencies<TKubeObject>> {
  get dependencies() {
    const {
      apiManager,
      hideDetails,
      editResourceTab,
      cluster,
      kubeObjectMenuRegistry,
    } = this.props;

    return {
      apiManager,
      editResourceTab,
      hideDetails,
      kubeObjectMenuRegistry,
      cluster,
    };
  }

  get store() {
    const { object } = this.props;

    if (!object) return null;

    return this.dependencies.apiManager.getStore(object.selfLink);
  }

  get isEditable() {
    return this.props.editable ?? Boolean(this.store?.patch);
  }

  get isRemovable() {
    return this.props.removable ?? Boolean(this.store?.remove);
  }

  @boundMethod
  async update() {
    this.dependencies.hideDetails();
    this.dependencies.editResourceTab(this.props.object);
  }

  @boundMethod
  async remove() {
    this.dependencies.hideDetails();
    const { object, removeAction } = this.props;

    if (removeAction) await removeAction();
    else await this.store.remove(object);
  }

  @boundMethod
  getRemoveMessage() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    const breadcrumbParts = [
      this.dependencies.cluster?.name,
      object.getNs(),
      object.kind,
      object.getName(),
    ];

    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>
        Remove <b>{breadcrumb}</b>?
      </p>
    );
  }

  getMenuItems(): React.ReactChild[] {
    const { object, toolbar } = this.props;

    if (!object) {
      return [];
    }

    return this.dependencies.kubeObjectMenuRegistry
      .getItemsForKind(object.kind, object.apiVersion)
      .map(
        (
          {
            components: { MenuItem },
          }: { components: { MenuItem: React.ReactType<any> }},
          index: number,
        ) => (
          <MenuItem
            object={object}
            toolbar={toolbar}
            // TODO: Fix misuse of index in key
            key={`menu-item-${index}`}
          />
        ),
      );
  }

  render() {
    const { remove, update, getRemoveMessage, isEditable, isRemovable } = this;
    const { className, editable, removable, ...menuProps } = this.props;

    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={isEditable ? update : undefined}
        removeAction={isRemovable ? remove : undefined}
        removeConfirmationMessage={getRemoveMessage}
        {...menuProps}
      >
        {this.getMenuItems()}
      </MenuActions>
    );
  }
}
