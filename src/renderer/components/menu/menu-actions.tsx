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

import "./menu-actions.scss";

import React, { isValidElement } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { boundMethod, cssNames } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import { Icon, IconProps } from "../icon";
import { Menu, MenuItem, MenuProps } from "./menu";
import uniqueId from "lodash/uniqueId";
import isString from "lodash/isString";

export interface MenuActionsProps extends Partial<MenuProps> {
  className?: string;
  toolbar?: boolean; // display menu as toolbar with icons
  autoCloseOnSelect?: boolean;
  triggerIcon?: string | IconProps | React.ReactNode;
  removeConfirmationMessage?: React.ReactNode | (() => React.ReactNode);
  updateAction?(): void;
  removeAction?(): void;
  onOpen?(): void;
}

@observer
export class MenuActions extends React.Component<MenuActionsProps> {
  static defaultProps: MenuActionsProps = {
    get removeConfirmationMessage() {
      return `Remove item?`;
    },
  };

  public id = uniqueId("menu_actions_");

  @observable isOpen = !!this.props.toolbar;

  toggle = () => {
    if (this.props.toolbar) return;
    this.isOpen = !this.isOpen;
  };

  constructor(props: MenuActionsProps) {
    super(props);
    makeObservable(this);
  }

  @boundMethod
  remove() {
    const { removeAction } = this.props;
    let { removeConfirmationMessage } = this.props;

    if (typeof removeConfirmationMessage === "function") {
      removeConfirmationMessage = removeConfirmationMessage();
    }
    ConfirmDialog.open({
      ok: removeAction,
      labelOk: `Remove`,
      message: <div>{removeConfirmationMessage}</div>,
    });
  }

  renderTriggerIcon() {
    if (this.props.toolbar) return null;
    const { triggerIcon = "more_vert" } = this.props;
    let className: string;

    if (isValidElement<HTMLElement>(triggerIcon)) {
      className = cssNames(triggerIcon.props.className, { active: this.isOpen });

      return React.cloneElement(triggerIcon, { id: this.id, className } as any);
    }
    const iconProps: Partial<IconProps> = {
      id: this.id,
      interactive: true,
      material: isString(triggerIcon) ? triggerIcon : undefined,
      active: this.isOpen,
      ...(typeof triggerIcon === "object" ? triggerIcon : {}),
    };

    if (this.props.onOpen) {
      iconProps.onClick = this.props.onOpen;
    }

    if (iconProps.tooltip && this.isOpen) {
      delete iconProps.tooltip; // don't show tooltip for icon when menu is open
    }

    return (
      <Icon {...iconProps}/>
    );
  }

  render() {
    const {
      className, toolbar, autoCloseOnSelect, children, updateAction, removeAction, triggerIcon, removeConfirmationMessage,
      ...menuProps
    } = this.props;
    const menuClassName = cssNames("MenuActions flex", className, {
      toolbar,
      gaps: toolbar, // add spacing for .flex
    });
    const autoClose = !toolbar;

    return (
      <>
        {this.renderTriggerIcon()}

        <Menu
          htmlFor={this.id}
          isOpen={this.isOpen} open={this.toggle} close={this.toggle}
          className={menuClassName}
          usePortal={autoClose}
          closeOnScroll={autoClose}
          closeOnClickItem={autoCloseOnSelect ?? autoClose }
          closeOnClickOutside={autoClose}
          {...menuProps}
        >
          {children}
          {updateAction && (
            <MenuItem onClick={updateAction}>
              <Icon material="edit" interactive={toolbar} tooltip="Edit"/>
              <span className="title">Edit</span>
            </MenuItem>
          )}
          {removeAction && (
            <MenuItem onClick={this.remove} data-testid="menu-action-remove">
              <Icon material="delete" interactive={toolbar} tooltip="Delete"/>
              <span className="title">Delete</span>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}
