/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu-actions.scss";

import React, { isValidElement } from "react";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { autoBind, cssNames } from "../../utils";
import { ConfirmDialog } from "../confirm-dialog";
import type { IconProps } from "../icon";
import { Icon } from "../icon";
import type { MenuProps } from "./menu";
import { Menu, MenuItem } from "./menu";
import uniqueId from "lodash/uniqueId";
import isString from "lodash/isString";
import type { TooltipDecoratorProps } from "../tooltip";

export interface MenuActionsProps extends Partial<MenuProps> {
  className?: string;
  toolbar?: boolean; // display menu as toolbar with icons
  autoCloseOnSelect?: boolean;
  triggerIcon?: string | (IconProps & TooltipDecoratorProps) | React.ReactNode;
  removeConfirmationMessage?: React.ReactNode | (() => React.ReactNode);
  updateAction?: () => void | Promise<void>;
  removeAction?: () => void | Promise<void>;
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
    autoBind(this);
  }

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

      return React.cloneElement(triggerIcon, { id: this.id, className });
    }
    const iconProps: IconProps & TooltipDecoratorProps = {
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
          isOpen={this.isOpen}
          open={this.toggle}
          close={this.toggle}
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
              <Icon
                material="edit"
                interactive={toolbar}
                tooltip="Edit"
              />
              <span className="title">Edit</span>
            </MenuItem>
          )}
          {removeAction && (
            <MenuItem onClick={this.remove} data-testid="menu-action-remove">
              <Icon
                material="delete"
                interactive={toolbar}
                tooltip="Delete"
              />
              <span className="title">Delete</span>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}
