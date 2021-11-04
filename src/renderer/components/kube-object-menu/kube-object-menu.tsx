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

import type { KubeObjectMenuRegistry } from "../../../extensions/registries";
import type { CatalogEntityRegistry } from "../../api/catalog-entity-registry";
import type { IGettableStore } from "../../../common/k8s-api/api-manager";


export interface KubeObjectMenuProps<T> extends MenuActionsProps {
  object: T | null | undefined;
  editable?: boolean;
  removable?: boolean;
}

interface KubeObjectMenuDependencies<T> extends KubeObjectMenuProps<T>{
  apiManager: IGettableStore,
  hideDetails: Function,
  editResourceTab: Function,
  catalogEntityRegistry: CatalogEntityRegistry,
  kubeObjectMenuRegistry: KubeObjectMenuRegistry
}

export class KubeObjectMenu<T extends KubeObject> extends React.Component<KubeObjectMenuDependencies<T>> {
  get dependencies() {
    const {
      apiManager,
      hideDetails,
      editResourceTab,
      catalogEntityRegistry,
      kubeObjectMenuRegistry,
    } = this.props;

    return {
      apiManager,
      editResourceTab,
      hideDetails,
      kubeObjectMenuRegistry,
      catalogEntityRegistry,
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
      this.dependencies.catalogEntityRegistry.activeEntity?.metadata?.name,
      object.getNs(),
      object.kind,
      object.getName(),
    ];

    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>Remove <b>{breadcrumb}</b>?</p>
    );
  }

  getMenuItems(): React.ReactChild[] {
    const { object, toolbar } = this.props;

    if (!object) {
      return [];
    }

    return this.dependencies.kubeObjectMenuRegistry
      .getItemsForKind(object.kind, object.apiVersion)
      .map(({ components: { MenuItem }}, index) => (
        <MenuItem
          object={object}
          key={`menu-item-${index}`}
          toolbar={toolbar}
        />
      ));
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
