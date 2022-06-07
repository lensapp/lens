/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./menu-actions.scss";

import React, { isValidElement } from "react";
import { observable, makeObservable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { autoBind, cssNames } from "../../utils";
import type { IconProps } from "../icon";
import { Icon } from "../icon";
import type { MenuProps } from "./menu";
import { Menu, MenuItem } from "./menu";
import uniqueId from "lodash/uniqueId";
import isString from "lodash/isString";
import type { TooltipDecoratorProps } from "../tooltip";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";

export interface MenuActionsProps extends Partial<MenuProps> {
  className?: string;
  toolbar?: boolean; // display menu as toolbar with icons
  autoCloseOnSelect?: boolean;
  triggerIcon?: string | (IconProps & TooltipDecoratorProps) | React.ReactNode;
  /**
   * @deprecated Provide your own remove `<MenuItem>` as part of the `children` passed to this component
   */
  removeConfirmationMessage?: React.ReactNode | (() => React.ReactNode);
  /**
   * @deprecated Provide your own update `<MenuItem>` as part of the `children` passed to this component
   */
  updateAction?: () => void | Promise<void>;
  /**
   * @deprecated Provide your own remove `<MenuItem>` as part of the `children` passed to this component
   */
  removeAction?: () => void | Promise<void>;
  onOpen?: () => void;
}

interface Dependencies {
  openConfirmDialog: OpenConfirmDialog;
}

@observer
class NonInjectedMenuActions extends React.Component<MenuActionsProps & Dependencies> {
  static defaultProps = {
    removeConfirmationMessage: "Remove item?",
  };

  // TODO: Make deterministic
  public id = uniqueId("menu_actions_");

  @observable isOpen = !!this.props.toolbar;

  toggle = () => {
    if (this.props.toolbar) return;
    this.isOpen = !this.isOpen;
  };

  constructor(props: MenuActionsProps & Dependencies) {
    super(props);
    makeObservable(this);
    autoBind(this);
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => this.isOpen, (isOpen) => {
        if (isOpen) {
          this.props.onOpen?.();
        }
      }, {
        fireImmediately: true,
      }),
    ]);
  }

  remove() {
    const { removeAction, openConfirmDialog } = this.props;
    let { removeConfirmationMessage } = this.props;

    if (typeof removeConfirmationMessage === "function") {
      removeConfirmationMessage = removeConfirmationMessage();
    }
    openConfirmDialog({
      ok: removeAction,
      labelOk: "Remove",
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
    const autoClose = !toolbar;

    return (
      <>
        {this.renderTriggerIcon()}

        <Menu
          htmlFor={this.id}
          isOpen={this.isOpen}
          open={this.toggle}
          close={this.toggle}
          className={cssNames("MenuActions flex", className, {
            toolbar,
            gaps: toolbar, // add spacing for .flex
          })}
          animated={!toolbar}
          usePortal={autoClose}
          closeOnScroll={autoClose}
          closeOnClickItem={autoCloseOnSelect ?? autoClose}
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

export const MenuActions = withInjectables<Dependencies, MenuActionsProps>(NonInjectedMenuActions, {
  getProps: (di, props) => ({
    ...props,
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
