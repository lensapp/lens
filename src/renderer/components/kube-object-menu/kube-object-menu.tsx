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
import { MenuActions, MenuActionsProps } from "../menu";
import identity from "lodash/identity";

export interface KubeObjectMenuDependencies {
  kubeObjectMenuItems: React.ElementType[];
  clusterName: string;

  removeObject: () => Promise<void>
  updateObject: () => void
}

export interface KubeObjectMenuProps<TKubeObject> extends MenuActionsProps {
  object: TKubeObject | null | undefined;
  editable?: boolean;
  removable?: boolean;
}

export interface KubeObjectMenuPropsAndDependencies<TKubeObject>
  extends KubeObjectMenuProps<TKubeObject>,
    KubeObjectMenuDependencies {}

export class KubeObjectMenu<
  TKubeObject extends KubeObject,
> extends React.Component<KubeObjectMenuPropsAndDependencies<TKubeObject>> {
  get isEditable() {
    return this.props.editable; // ?? Boolean(this.store?.patch);
  }

  get isRemovable() {
    return this.props.removable; // ?? Boolean(this.store?.remove);
  }

  @boundMethod
  getRemoveMessage() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    const breadcrumbParts = [object.getNs(), object.getName()];

    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>
        Remove {object.kind} <b>{breadcrumb}</b> from <b>{this.props.clusterName}</b>?
      </p>
    );
  }

  getMenuItems(): React.ReactChild[] {
    const { object, toolbar } = this.props;

    return this.props.kubeObjectMenuItems.map((MenuItem, index) => (
      <MenuItem
        object={object}
        toolbar={toolbar}
        // TODO: Fix misuse of index in key
        key={`menu-item-${index}`}
      />
    ));
  }

  render() {
    const { getRemoveMessage, isEditable, isRemovable } = this;
    const { className, editable, updateObject, removable, removeObject, ...menuProps } = this.props;

    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}

        {...(isEditable ? { updateAction: updateObject } : {})}
        {...(isRemovable ? { removeAction: removeObject } : {})}

        removeConfirmationMessage={getRemoveMessage}
        {...menuProps}
      >
        {this.getMenuItems()}
      </MenuActions>
    );
  }
}
